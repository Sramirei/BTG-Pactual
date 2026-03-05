import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "./env.js";

const dynamoDbBaseClient = new DynamoDBClient({ region: env.awsRegion });

export const dynamoClient = DynamoDBDocumentClient.from(dynamoDbBaseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const snsClient = new SNSClient({ region: env.awsRegion });
