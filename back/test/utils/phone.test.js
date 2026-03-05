import assert from "node:assert/strict";
import test from "node:test";
import { normalizePhoneNumber } from "../../src/utils/phone.js";

test("normalizePhoneNumber agrega +57 por defecto", () => {
  const normalized = normalizePhoneNumber("3001112233");
  assert.equal(normalized, "+573001112233");
});

test("normalizePhoneNumber mantiene formato E.164 si ya viene con +", () => {
  const normalized = normalizePhoneNumber("+573001112233");
  assert.equal(normalized, "+573001112233");
});

test("normalizePhoneNumber retorna null cuando no puede normalizar", () => {
  const normalized = normalizePhoneNumber("abc");
  assert.equal(normalized, null);
});
