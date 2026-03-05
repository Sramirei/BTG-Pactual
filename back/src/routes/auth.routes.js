import { Router } from "express";
import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", asyncHandler(registerController));
router.post("/login", asyncHandler(loginController));
router.get("/me", authenticate, asyncHandler(meController));

export default router;
