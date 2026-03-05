import assert from "node:assert/strict";
import test from "node:test";
import { comparePassword, hashPassword } from "../../src/utils/password.js";

test("hashPassword genera un hash bcrypt", async () => {
  const hash = await hashPassword("ClaveSegura123");

  assert.match(hash, /^\$2[aby]\$/);
  assert.notEqual(hash, "ClaveSegura123");
});

test("comparePassword valida correctamente una contraseña", async () => {
  const hash = await hashPassword("ClaveSegura123");

  const isValid = await comparePassword("ClaveSegura123", hash);
  const isInvalid = await comparePassword("otra-clave", hash);

  assert.equal(isValid, true);
  assert.equal(isInvalid, false);
});
