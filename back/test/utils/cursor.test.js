import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../src/errors/app-error.js";
import { decodeCursor, encodeCursor } from "../../src/utils/cursor.js";

test("encodeCursor y decodeCursor mantienen el objeto original", () => {
  const key = {
    userId: "user-1",
    transactionKey: "2026-03-05T00:00:00.000Z#txn-1",
  };

  const encoded = encodeCursor(key);
  const decoded = decodeCursor(encoded);

  assert.equal(typeof encoded, "string");
  assert.deepEqual(decoded, key);
});

test("decodeCursor lanza AppError 400 con cursor invalido", () => {
  assert.throws(
    () => decodeCursor("cursor-invalido"),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "Cursor invalido",
  );
});
