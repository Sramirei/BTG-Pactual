import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../support/env-helper.js";

ensureTestEnv({ NODE_ENV: "test" });

const { AppError } = await import("../../src/errors/app-error.js");
const { errorHandler } = await import("../../src/middlewares/error.middleware.js");

const createResponseMock = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("errorHandler responde con status y mensaje de AppError", () => {
  const res = createResponseMock();
  const error = new AppError(422, "Datos invalidos", { field: "email" });

  errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, {
    message: "Datos invalidos",
    details: { field: "email" },
  });
});

test("errorHandler responde 500 para errores no controlados", () => {
  const res = createResponseMock();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    errorHandler(new Error("fallo inesperado"), {}, res, () => {});
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, "Error interno del servidor");
  assert.equal(res.body.error, "fallo inesperado");
});
