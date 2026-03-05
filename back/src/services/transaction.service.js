import { listTransactionsByUser } from "../repositories/transaction.repository.js";

export const getTransactionHistory = async (userId, { limit, cursor }) => {
  const { items, nextCursor } = await listTransactionsByUser(userId, { limit, cursor });

  return {
    items,
    nextCursor,
  };
};
