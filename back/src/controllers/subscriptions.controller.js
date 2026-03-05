import {
  cancelSubscription,
  listActiveSubscriptions,
  subscribeToFund,
} from "../services/portfolio.service.js";

export const subscribeController = async (req, res) => {
  const { fundId, amount } = req.body;
  const result = await subscribeToFund({
    userId: req.user.userId,
    fundId,
    amount,
  });

  res.status(201).json(result);
};

export const cancelSubscriptionController = async (req, res) => {
  const result = await cancelSubscription({
    userId: req.user.userId,
    fundId: req.params.fundId,
  });

  res.status(200).json(result);
};

export const listSubscriptionsController = async (req, res) => {
  const items = await listActiveSubscriptions(req.user.userId);
  res.status(200).json({ items });
};
