import assert from "node:assert/strict";
import test from "node:test";
import { asyncHandler } from "../../src/utils/async-handler.js";

test("asyncHandler reenvia errores asincronos a next", async () => {
  const expectedError = new Error("fallo controlado");
  const wrapped = asyncHandler(async () => {
    throw expectedError;
  });

  let receivedError;
  wrapped({}, {}, (error) => {
    receivedError = error;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(receivedError, expectedError);
});

test("asyncHandler ejecuta la funcion original", async () => {
  let called = false;
  const wrapped = asyncHandler(async () => {
    called = true;
  });

  wrapped({}, {}, () => {});

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(called, true);
});
