import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../support/env-helper.js";

ensureTestEnv();

const { AppError } = await import("../../src/errors/app-error.js");
const { authenticate, authorize } = await import("../../src/middlewares/auth.middleware.js");
const { signAccessToken } = await import("../../src/utils/jwt.js");

test("authenticate retorna 401 si falta header Authorization", () => {
  const errors = [];
  const req = { headers: {} };

  authenticate(req, {}, (error) => errors.push(error));

  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof AppError);
  assert.equal(errors[0].statusCode, 401);
  assert.equal(errors[0].message, "Token requerido");
});

test("authenticate agrega req.user cuando el token es valido", () => {
  const token = signAccessToken({
    sub: "user-123",
    role: "CLIENT",
    email: "user@example.com",
  });

  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const nextCalls = [];

  authenticate(req, {}, (error) => nextCalls.push(error));

  assert.equal(nextCalls.length, 1);
  assert.equal(nextCalls[0], undefined);
  assert.deepEqual(req.user, {
    userId: "user-123",
    role: "CLIENT",
    email: "user@example.com",
  });
});

test("authenticate retorna 401 cuando el token no es valido", () => {
  const errors = [];
  const req = {
    headers: {
      authorization: "Bearer token-no-valido",
    },
  };

  authenticate(req, {}, (error) => errors.push(error));

  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof AppError);
  assert.equal(errors[0].statusCode, 401);
  assert.equal(errors[0].message, "Token invalido o expirado");
});

test("authorize retorna 401 cuando no existe req.user", () => {
  const middleware = authorize("ADMIN");
  const errors = [];

  middleware({}, {}, (error) => errors.push(error));

  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof AppError);
  assert.equal(errors[0].statusCode, 401);
  assert.equal(errors[0].message, "Usuario no autenticado");
});

test("authorize retorna 403 cuando el rol no esta permitido", () => {
  const middleware = authorize("ADMIN");
  const req = { user: { role: "CLIENT" } };
  const errors = [];

  middleware(req, {}, (error) => errors.push(error));

  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof AppError);
  assert.equal(errors[0].statusCode, 403);
  assert.equal(errors[0].message, "No tiene permisos para ejecutar esta accion");
});

test("authorize llama next sin error cuando el rol esta permitido", () => {
  const middleware = authorize("ADMIN", "CLIENT");
  const req = { user: { role: "CLIENT" } };
  const nextCalls = [];

  middleware(req, {}, (error) => nextCalls.push(error));

  assert.equal(nextCalls.length, 1);
  assert.equal(nextCalls[0], undefined);
});
