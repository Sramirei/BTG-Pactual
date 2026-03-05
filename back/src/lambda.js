import serverless from "serverless-http";
import app from "./app.js";
import { seedDefaultFunds } from "./services/bootstrap.service.js";

const bootstrapPromise = seedDefaultFunds();
const expressHandler = serverless(app);

export const handler = async (event, context) => {
  await bootstrapPromise;
  return expressHandler(event, context);
};
