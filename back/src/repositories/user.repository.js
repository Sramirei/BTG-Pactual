import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws-clients.js";
import { env } from "../config/env.js";

export const findUserById = async (userId) => {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: env.usersTable,
      Key: { userId },
    }),
  );

  return response.Item ?? null;
};

export const findUserByEmail = async (email) => {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: env.usersTable,
      IndexName: "email-index",
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: {
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":email": email,
      },
      Limit: 1,
    }),
  );

  return response.Items?.[0] ?? null;
};

export const createUser = async (user) => {
  await dynamoClient.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: user,
      ConditionExpression: "attribute_not_exists(userId)",
    }),
  );

  return user;
};

export const updateUserNotificationState = async (
  userId,
  { emailSubscriptionStatus, emailSubscriptionArn },
) => {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: env.usersTable,
      Key: { userId },
      UpdateExpression:
        "SET emailSubscriptionStatus = :status, emailSubscriptionArn = :arn, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":status": emailSubscriptionStatus ?? null,
        ":arn": emailSubscriptionArn ?? null,
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );
};
