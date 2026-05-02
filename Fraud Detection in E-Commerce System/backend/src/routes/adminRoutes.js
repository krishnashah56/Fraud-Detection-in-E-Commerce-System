import { Router } from "express";
import rateLimit from "express-rate-limit";
import upload from "../middleware/uploadMiddleware.js";
import verifyAdminAuth from "../middleware/authMiddleware.js";

import {
  analyzeDataset,
  getDashboardStats,
  getFraudLogs,
  getRecentTransactions,
  getUsers,
  reviewTransaction,
  bulkReviewTransactions
} from "../controllers/adminController.js";
import { login, logout, getSession } from "../controllers/authController.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many failed login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/session", getSession);
router.use(verifyAdminAuth);

router.get("/dashboard-stats", getDashboardStats);
router.get("/recent-transactions", getRecentTransactions);
router.get("/fraud-logs", getFraudLogs);
router.get("/users", getUsers);
router.post("/analyze-dataset", upload.single("dataset"), analyzeDataset);
router.post("/review-transaction", reviewTransaction);
router.post("/bulk-review", bulkReviewTransactions);

export default router;
