const DEFAULT_ENV = Object.freeze({
  NODE_ENV: "test",
  JWT_SECRET: "test-secret",
  JWT_EXPIRES_IN: "1h",
  USERS_TABLE: "btg-users-test",
  FUNDS_TABLE: "btg-funds-test",
  SUBSCRIPTIONS_TABLE: "btg-subscriptions-test",
  TRANSACTIONS_TABLE: "btg-transactions-test",
  INITIAL_BALANCE: "500000",
  AWS_REGION: "us-east-1",
});

export const ensureTestEnv = (overrides = {}) => {
  const values = { ...DEFAULT_ENV, ...overrides };

  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
};
