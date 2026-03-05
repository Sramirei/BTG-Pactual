import { Router } from "express";
import {
  createFundController,
  listFundsController,
} from "../controllers/funds.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", authenticate, asyncHandler(listFundsController));
router.post("/", authenticate, authorize(ROLES.ADMIN), asyncHandler(createFundController));

export default router;
