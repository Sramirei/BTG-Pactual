import { randomUUID } from "crypto";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws-clients.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { getFundById } from "../repositories/fund.repository.js";
import {
  getSubscriptionByUserAndFund,
  listSubscriptionsByUser,
} from "../repositories/subscription.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { sendSubscriptionNotification } from "./notification.service.js";

const toIntegerAmount = (value) => Number.parseInt(String(value), 10);

export const subscribeToFund = async ({ userId, fundId, amount }) => {
  if (!fundId) {
    throw new AppError(400, "fundId es obligatorio");
  }

  const [user, fund, existingSubscription] = await Promise.all([
    findUserById(userId),
    getFundById(String(fundId)),
    getSubscriptionByUserAndFund(userId, String(fundId)),
  ]);

  if (!user) {
    throw new AppError(404, "Usuario no encontrado");
  }

  if (!fund) {
    throw new AppError(404, "Fondo no encontrado");
  }

  if (existingSubscription) {
    throw new AppError(409, `Ya existe una suscripcion activa al fondo ${fund.name}`);
  }

  const amountToLink = amount !== undefined ? toIntegerAmount(amount) : fund.minimumAmount;

  if (!Number.isFinite(amountToLink) || amountToLink <= 0) {
    throw new AppError(400, "amount debe ser un entero positivo");
  }

  if (amountToLink < fund.minimumAmount) {
    throw new AppError(
      400,
      `El monto minimo para ${fund.name} es COP ${fund.minimumAmount.toLocaleString("es-CO")}`,
    );
  }

  if (user.availableBalance < amountToLink) {
    throw new AppError(400, `No tiene saldo disponible para vincularse al fondo ${fund.name}`);
  }

  const now = new Date().toISOString();
  const transactionId = randomUUID();
  const transactionKey = `${now}#${transactionId}`;

  const subscriptionRecord = {
    userId,
    fundId: fund.fundId,
    subscriptionId: randomUUID(),
    fundName: fund.name,
    category: fund.category,
    amount: amountToLink,
    openedAt: now,
    updatedAt: now,
  };

  const transactionRecord = {
    userId,
    transactionKey,
    transactionId,
    type: "OPEN",
    fundId: fund.fundId,
    fundName: fund.name,
    amount: amountToLink,
    createdAt: now,
  };

  try {
    await dynamoClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: env.usersTable,
              Key: { userId },
              UpdateExpression:
                "SET availableBalance = availableBalance - :amount, updatedAt = :updatedAt",
              ConditionExpression: "availableBalance >= :amount",
              ExpressionAttributeValues: {
                ":amount": amountToLink,
                ":updatedAt": now,
              },
            },
          },
          {
            Put: {
              TableName: env.subscriptionsTable,
              Item: subscriptionRecord,
              ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(fundId)",
            },
          },
          {
            Put: {
              TableName: env.transactionsTable,
              Item: transactionRecord,
              ConditionExpression:
                "attribute_not_exists(userId) AND attribute_not_exists(transactionKey)",
            },
          },
        ],
      }),
    );
  } catch (error) {
    if (error.name === "TransactionCanceledException") {
      const freshUser = await findUserById(userId);
      if (freshUser && freshUser.availableBalance < amountToLink) {
        throw new AppError(400, `No tiene saldo disponible para vincularse al fondo ${fund.name}`);
      }

      throw new AppError(409, "No fue posible completar la suscripcion. Intente nuevamente");
    }

    throw error;
  }

  let notification = { delivered: false, reason: "not_processed" };

  try {
    notification = await sendSubscriptionNotification({
      user,
      fund,
      amount: amountToLink,
      transactionId,
    });
  } catch (error) {
    console.error("Notification delivery failed", {
      name: error?.name,
      message: error?.message,
    });

    notification = {
      delivered: false,
      reason: "sns_publish_failed",
      errorCode: error?.name ?? "UnknownError",
      errorMessage: error?.message ?? "Unknown notification error",
    };
  }

  return {
    transactionId,
    subscription: subscriptionRecord,
    availableBalance: user.availableBalance - amountToLink,
    notification,
  };
};

export const cancelSubscription = async ({ userId, fundId }) => {
  if (!fundId) {
    throw new AppError(400, "fundId es obligatorio");
  }

  const [user, subscription] = await Promise.all([
    findUserById(userId),
    getSubscriptionByUserAndFund(userId, String(fundId)),
  ]);

  if (!user) {
    throw new AppError(404, "Usuario no encontrado");
  }

  if (!subscription) {
    throw new AppError(404, "No existe una suscripcion activa para ese fondo");
  }

  const now = new Date().toISOString();
  const transactionId = randomUUID();
  const transactionKey = `${now}#${transactionId}`;

  const transactionRecord = {
    userId,
    transactionKey,
    transactionId,
    type: "CANCEL",
    fundId: subscription.fundId,
    fundName: subscription.fundName,
    amount: subscription.amount,
    createdAt: now,
  };

  await dynamoClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Delete: {
            TableName: env.subscriptionsTable,
            Key: {
              userId,
              fundId: subscription.fundId,
            },
            ConditionExpression: "attribute_exists(userId) AND attribute_exists(fundId)",
          },
        },
        {
          Update: {
            TableName: env.usersTable,
            Key: { userId },
            UpdateExpression:
              "SET availableBalance = availableBalance + :amount, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":amount": subscription.amount,
              ":updatedAt": now,
            },
          },
        },
        {
          Put: {
            TableName: env.transactionsTable,
            Item: transactionRecord,
            ConditionExpression:
              "attribute_not_exists(userId) AND attribute_not_exists(transactionKey)",
          },
        },
      ],
    }),
  );

  return {
    transactionId,
    refundedAmount: subscription.amount,
    availableBalance: user.availableBalance + subscription.amount,
  };
};

export const topUpBalance = async ({ userId, amount }) => {
  const amountToCredit = toIntegerAmount(amount);
  if (!Number.isFinite(amountToCredit) || amountToCredit <= 0) {
    throw new AppError(400, "amount debe ser un entero positivo");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "Usuario no encontrado");
  }

  const now = new Date().toISOString();
  const transactionId = randomUUID();
  const transactionKey = `${now}#${transactionId}`;

  const transactionRecord = {
    userId,
    transactionKey,
    transactionId,
    type: "TOPUP",
    fundId: "WALLET",
    fundName: "RECARGA DE SALDO",
    amount: amountToCredit,
    createdAt: now,
  };

  await dynamoClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: env.usersTable,
            Key: { userId },
            UpdateExpression:
              "SET availableBalance = availableBalance + :amount, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":amount": amountToCredit,
              ":updatedAt": now,
            },
          },
        },
        {
          Put: {
            TableName: env.transactionsTable,
            Item: transactionRecord,
            ConditionExpression:
              "attribute_not_exists(userId) AND attribute_not_exists(transactionKey)",
          },
        },
      ],
    }),
  );

  return {
    transactionId,
    creditedAmount: amountToCredit,
    availableBalance: user.availableBalance + amountToCredit,
  };
};

export const listActiveSubscriptions = async (userId) => {
  const subscriptions = await listSubscriptionsByUser(userId);

  return subscriptions.sort((a, b) => a.openedAt.localeCompare(b.openedAt));
};
