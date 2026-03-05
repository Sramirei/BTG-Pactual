import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token requerido"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    return next();
  } catch {
    return next(new AppError(401, "Token invalido o expirado"));
  }
};

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(401, "Usuario no autenticado"));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError(403, "No tiene permisos para ejecutar esta accion"));
  }

  return next();
};
