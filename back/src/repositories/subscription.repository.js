import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws-clients.js";
import { env } from "../config/env.js";

export const getSubscriptionByUserAndFund = async (userId, fundId) => {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: env.subscriptionsTable,
      Key: {
        userId,
        fundId,
      },
    }),
  );

  return response.Item ?? null;
};

export const listSubscriptionsByUser = async (userId) => {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: env.subscriptionsTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }),
  );

  return response.Items ?? [];
};
