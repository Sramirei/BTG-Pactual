import { Router } from "express";
import authRoutes from "./auth.routes.js";
import fundsRoutes from "./funds.routes.js";
import subscriptionsRoutes from "./subscriptions.routes.js";
import transactionsRoutes from "./transactions.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/funds", fundsRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/transactions", transactionsRoutes);

export default router;
