import { Router } from "express";
import {
  listTransactionsController,
  topUpBalanceController,
} from "../controllers/transactions.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", authenticate, asyncHandler(listTransactionsController));
router.post("/top-up", authenticate, asyncHandler(topUpBalanceController));

export default router;
