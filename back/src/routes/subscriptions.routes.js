import { Router } from "express";
import {
  cancelSubscriptionController,
  listSubscriptionsController,
  subscribeController,
} from "../controllers/subscriptions.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listSubscriptionsController));
router.post("/", asyncHandler(subscribeController));
router.delete("/:fundId", asyncHandler(cancelSubscriptionController));

export default router;
