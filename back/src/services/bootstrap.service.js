import { DEFAULT_FUNDS } from "../constants/funds.js";
import { putFund } from "../repositories/fund.repository.js";

export const seedDefaultFunds = async () => {
  const now = new Date().toISOString();

  for (const fund of DEFAULT_FUNDS) {
    try {
      await putFund(
        {
          ...fund,
          createdAt: now,
          updatedAt: now,
        },
        true,
      );
    } catch (error) {
      if (error.name !== "ConditionalCheckFailedException") {
        throw error;
      }
    }
  }
};
