import { createFund, getFunds } from "../services/fund.service.js";

export const listFundsController = async (_req, res) => {
  const funds = await getFunds();
  res.status(200).json({ items: funds });
};

export const createFundController = async (req, res) => {
  const fund = await createFund(req.body);
  res.status(201).json(fund);
};
