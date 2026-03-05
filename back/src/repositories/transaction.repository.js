import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws-clients.js";
import { env } from "../config/env.js";
import { decodeCursor, encodeCursor } from "../utils/cursor.js";

export const listTransactionsByUser = async (userId, { limit = 20, cursor } = {}) => {
  const parsedLimit = Number.parseInt(String(limit), 10);
  const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;

  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: env.transactionsTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
      Limit: safeLimit,
      ...(cursor
        ? {
            ExclusiveStartKey: decodeCursor(cursor),
          }
        : {}),
    }),
  );

  return {
    items: response.Items ?? [],
    nextCursor: response.LastEvaluatedKey ? encodeCursor(response.LastEvaluatedKey) : null,
  };
};
