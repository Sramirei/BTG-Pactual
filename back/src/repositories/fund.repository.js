import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws-clients.js";
import { env } from "../config/env.js";

export const listFunds = async () => {
  const response = await dynamoClient.send(
    new ScanCommand({
      TableName: env.fundsTable,
    }),
  );

  return response.Items ?? [];
};

export const getFundById = async (fundId) => {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: env.fundsTable,
      Key: { fundId },
    }),
  );

  return response.Item ?? null;
};

export const putFund = async (fund, withCondition = false) => {
  await dynamoClient.send(
    new PutCommand({
      TableName: env.fundsTable,
      Item: fund,
      ...(withCondition ? { ConditionExpression: "attribute_not_exists(fundId)" } : {}),
    }),
  );

  return fund;
};
