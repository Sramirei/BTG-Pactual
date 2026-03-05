import { randomUUID } from "crypto";
import { ROLES } from "../constants/roles.js";
import { AppError } from "../errors/app-error.js";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import { signAccessToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { normalizePhoneNumber } from "../utils/phone.js";
import { env } from "../config/env.js";

const sanitizeUser = (user) => ({
  userId: user.userId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  notificationPreference: user.notificationPreference,
  emailSubscriptionStatus: user.emailSubscriptionStatus ?? null,
  emailSubscriptionArn: user.emailSubscriptionArn ?? null,
  availableBalance: user.availableBalance,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async ({ name, email, password, phone, notificationPreference }) => {
  if (!name || !email || !password || !notificationPreference) {
    throw new AppError(400, "name, email, password y notificationPreference son obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPreference = String(notificationPreference).trim().toUpperCase();

  if (!["EMAIL", "SMS"].includes(normalizedPreference)) {
    throw new AppError(400, "notificationPreference debe ser EMAIL o SMS");
  }

  if (password.length < 8) {
    throw new AppError(400, "La contrasena debe tener al menos 8 caracteres");
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  if (normalizedPreference === "SMS" && !normalizedPhone) {
    throw new AppError(400, "phone es obligatorio y debe tener formato valido cuando notificationPreference es SMS");
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError(409, "El email ya esta registrado");
  }

  const now = new Date().toISOString();

  const user = {
    userId: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPreference === "SMS" ? normalizedPhone : null,
    role: ROLES.CLIENT,
    notificationPreference: normalizedPreference,
    emailSubscriptionStatus: null,
    emailSubscriptionArn: null,
    availableBalance: env.initialBalance,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  await createUser(user);

  const token = signAccessToken({
    sub: user.userId,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError(400, "email y password son obligatorios");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(401, "Credenciales invalidas");
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new AppError(401, "Credenciales invalidas");
  }

  const token = signAccessToken({
    sub: user.userId,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "Usuario no encontrado");
  }

  return sanitizeUser(user);
};
