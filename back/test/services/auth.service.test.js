import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../support/env-helper.js";

ensureTestEnv();

const { AppError } = await import("../../src/errors/app-error.js");
const { login, register } = await import("../../src/services/auth.service.js");

test("register valida campos obligatorios", async () => {
  await assert.rejects(
    () =>
      register({
        name: "",
        email: "user@example.com",
        password: "ClaveSegura123",
        notificationPreference: "EMAIL",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "name, email, password y notificationPreference son obligatorios",
  );
});

test("register valida notificationPreference", async () => {
  await assert.rejects(
    () =>
      register({
        name: "Usuario",
        email: "user@example.com",
        password: "ClaveSegura123",
        notificationPreference: "PUSH",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "notificationPreference debe ser EMAIL o SMS",
  );
});

test("register valida longitud minima de password", async () => {
  await assert.rejects(
    () =>
      register({
        name: "Usuario",
        email: "user@example.com",
        password: "1234567",
        notificationPreference: "EMAIL",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "La contrasena debe tener al menos 8 caracteres",
  );
});

test("register exige phone cuando notificationPreference es SMS", async () => {
  await assert.rejects(
    () =>
      register({
        name: "Usuario",
        email: "user@example.com",
        password: "ClaveSegura123",
        notificationPreference: "SMS",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message ===
        "phone es obligatorio y debe tener formato valido cuando notificationPreference es SMS",
  );
});

test("login valida que email y password sean obligatorios", async () => {
  await assert.rejects(
    () =>
      login({
        email: "",
        password: "",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "email y password son obligatorios",
  );
});
