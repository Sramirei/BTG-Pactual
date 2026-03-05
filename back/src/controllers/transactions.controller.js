import { getTransactionHistory } from "../services/transaction.service.js";
import { topUpBalance } from "../services/portfolio.service.js";

export const listTransactionsController = async (req, res) => {
  const { limit, cursor } = req.query;

  const data = await getTransactionHistory(req.user.userId, {
    limit,
    cursor,
  });

  res.status(200).json(data);
};

export const topUpBalanceController = async (req, res) => {
  const { amount } = req.body;

  const data = await topUpBalance({
    userId: req.user.userId,
    amount,
  });

  res.status(200).json(data);
};
