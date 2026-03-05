import { AppError } from "../errors/app-error.js";
import { getFundById, listFunds, putFund } from "../repositories/fund.repository.js";

export const getFunds = async () => {
  const funds = await listFunds();

  return funds.sort((a, b) => Number.parseInt(a.fundId, 10) - Number.parseInt(b.fundId, 10));
};

export const createFund = async ({ fundId, name, minimumAmount, category }) => {
  if (!fundId || !name || !minimumAmount || !category) {
    throw new AppError(400, "fundId, name, minimumAmount y category son obligatorios");
  }

  const normalizedCategory = String(category).trim().toUpperCase();
  if (!["FPV", "FIC"].includes(normalizedCategory)) {
    throw new AppError(400, "category debe ser FPV o FIC");
  }

  const parsedAmount = Number.parseInt(String(minimumAmount), 10);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new AppError(400, "minimumAmount debe ser un entero positivo");
  }

  const existing = await getFundById(String(fundId));
  if (existing) {
    throw new AppError(409, `El fondo ${fundId} ya existe`);
  }

  const now = new Date().toISOString();

  const fund = {
    fundId: String(fundId),
    name: String(name).trim(),
    minimumAmount: parsedAmount,
    category: normalizedCategory,
    createdAt: now,
    updatedAt: now,
  };

  await putFund(fund, true);
  return fund;
};
