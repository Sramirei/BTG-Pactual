import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../support/env-helper.js";

ensureTestEnv();

const { AppError } = await import("../../src/errors/app-error.js");
const { topUpBalance } = await import("../../src/services/portfolio.service.js");

test("topUpBalance valida amount entero positivo", async () => {
  await assert.rejects(
    () =>
      topUpBalance({
        userId: "user-1",
        amount: 0,
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "amount debe ser un entero positivo",
  );
});
