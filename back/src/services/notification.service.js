import {
  ListSubscriptionsByTopicCommand,
  PublishCommand,
  SubscribeCommand,
} from "@aws-sdk/client-sns";
import { env } from "../config/env.js";
import { snsClient } from "../config/aws-clients.js";
import { updateUserNotificationState } from "../repositories/user.repository.js";
import { normalizePhoneNumber } from "../utils/phone.js";

const buildMessage = ({ user, fund, amount, transactionId }) =>
  [
    "Suscripcion confirmada",
    `Cliente: ${user.name}`,
    `Fondo: ${fund.name}`,
    `Monto: COP ${amount.toLocaleString("es-CO")}`,
    `Transaccion: ${transactionId}`,
  ].join("\n");

export const sendSubscriptionNotification = async ({ user, fund, amount, transactionId }) => {
  const preference = user.notificationPreference;
  const message = buildMessage({ user, fund, amount, transactionId });

  if (preference === "SMS") {
    const normalizedPhone = normalizePhoneNumber(user.phone);
    if (!normalizedPhone) {
      return {
        delivered: false,
        channel: "SMS",
        reason: "invalid_phone_format",
        hint: "El telefono debe estar en formato internacional. Ejemplo: +573001112233",
      };
    }

    await snsClient.send(
      new PublishCommand({
        PhoneNumber: normalizedPhone,
        Message: message,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: "Transactional",
          },
        },
      }),
    );

    return { delivered: true, channel: "SMS", destination: normalizedPhone };
  }

  if (!env.snsTopicArn) {
    return { delivered: false, channel: "EMAIL", reason: "missing_topic_arn" };
  }

  if (!user.email) {
    return { delivered: false, channel: "EMAIL", reason: "missing_email" };
  }

  const emailSubscription = await ensureEmailSubscription(user);

  if (!emailSubscription.confirmed) {
    return {
      delivered: false,
      channel: "EMAIL",
      reason: "email_confirmation_pending",
    };
  }

  await snsClient.send(
    new PublishCommand({
      TopicArn: env.snsTopicArn,
      Subject: "Nueva suscripcion BTG Pactual",
      Message: message,
      MessageAttributes: {
        userId: {
          DataType: "String",
          StringValue: user.userId,
        },
      },
    }),
  );

  return { delivered: true, channel: "EMAIL" };
};

const findEmailSubscriptionInTopic = async (email) => {
  let nextToken = undefined;
  const normalizedEmail = email.trim().toLowerCase();

  do {
    const response = await snsClient.send(
      new ListSubscriptionsByTopicCommand({
        TopicArn: env.snsTopicArn,
        NextToken: nextToken,
      }),
    );

    const match = (response.Subscriptions ?? []).find(
      (subscription) =>
        subscription.Protocol === "email" &&
        subscription.Endpoint?.trim().toLowerCase() === normalizedEmail,
    );

    if (match) {
      return match;
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return null;
};

const ensureEmailSubscription = async (user) => {
  const existing = await findEmailSubscriptionInTopic(user.email);

  if (existing) {
    const isConfirmed = !String(existing.SubscriptionArn ?? "")
      .toLowerCase()
      .includes("pending");

    await updateUserNotificationState(user.userId, {
      emailSubscriptionStatus: isConfirmed ? "CONFIRMED" : "PENDING_CONFIRMATION",
      emailSubscriptionArn: existing.SubscriptionArn ?? null,
    });

    return { confirmed: isConfirmed };
  }

  const response = await snsClient.send(
    new SubscribeCommand({
      TopicArn: env.snsTopicArn,
      Protocol: "email",
      Endpoint: user.email,
      ReturnSubscriptionArn: true,
      Attributes: {
        FilterPolicy: JSON.stringify({
          userId: [user.userId],
        }),
      },
    }),
  );

  const arn = response.SubscriptionArn ?? null;
  const isConfirmed = !String(arn ?? "").toLowerCase().includes("pending");

  await updateUserNotificationState(user.userId, {
    emailSubscriptionStatus: isConfirmed ? "CONFIRMED" : "PENDING_CONFIRMATION",
    emailSubscriptionArn: arn,
  });

  return { confirmed: isConfirmed };
};
