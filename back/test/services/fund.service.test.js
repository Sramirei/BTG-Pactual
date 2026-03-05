import assert from "node:assert/strict";
import test from "node:test";
import { ensureTestEnv } from "../../support/env-helper.js";

ensureTestEnv();

const { AppError } = await import("../../src/errors/app-error.js");
const { createFund } = await import("../../src/services/fund.service.js");

test("createFund valida campos obligatorios", async () => {
  await assert.rejects(
    () =>
      createFund({
        fundId: "",
        name: "Fondo Test",
        minimumAmount: 1000,
        category: "FIC",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "fundId, name, minimumAmount y category son obligatorios",
  );
});

test("createFund valida category permitida", async () => {
  await assert.rejects(
    () =>
      createFund({
        fundId: "10",
        name: "Fondo Test",
        minimumAmount: 1000,
        category: "ETF",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "category debe ser FPV o FIC",
  );
});

test("createFund valida minimumAmount positivo", async () => {
  await assert.rejects(
    () =>
      createFund({
        fundId: "10",
        name: "Fondo Test",
        minimumAmount: -1,
        category: "FPV",
      }),
    (error) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === "minimumAmount debe ser un entero positivo",
  );
});
