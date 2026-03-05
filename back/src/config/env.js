import dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  "JWT_SECRET",
  "USERS_TABLE",
  "FUNDS_TABLE",
  "SUBSCRIPTIONS_TABLE",
  "TRANSACTIONS_TABLE",
];

for (const name of requiredVars) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const initialBalance = Number.parseInt(process.env.INITIAL_BALANCE ?? "500000", 10);
if (!Number.isFinite(initialBalance) || initialBalance < 0) {
  throw new Error("INITIAL_BALANCE must be a non-negative integer");
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  awsRegion: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  initialBalance,
  usersTable: process.env.USERS_TABLE,
  fundsTable: process.env.FUNDS_TABLE,
  subscriptionsTable: process.env.SUBSCRIPTIONS_TABLE,
  transactionsTable: process.env.TRANSACTIONS_TABLE,
  snsTopicArn: process.env.SNS_TOPIC_ARN ?? "",
});
