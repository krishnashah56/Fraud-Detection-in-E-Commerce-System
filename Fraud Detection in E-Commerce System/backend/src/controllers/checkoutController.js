import FraudLog from "../models/FraudLog.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  encodeDeviceType,
  getRiskLevelFromScore,
  resolveBackendDecision
} from "../services/fraudDecisionService.js";
import { predictFraud } from "../services/mlService.js";

const buildTransactionId = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TXN-${stamp}-${random}`;
};

export const checkout = asyncHandler(async (req, res) => {
  const {
    userId,
    amount,
    ipAddress,
    deviceType = "desktop",
    timeSinceLastOrder
  } = req.body;

  if (!userId || amount === undefined || amount === null || !ipAddress) {
    const error = new Error("userId, amount, and ipAddress are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ userId });

  if (!user) {
    const error = new Error(`User ${userId} was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const computedTimeSinceLastOrder =
    typeof timeSinceLastOrder === "number"
      ? timeSinceLastOrder
      : user.lastOrderAt
        ? Math.max(
            1,
            Math.round((Date.now() - new Date(user.lastOrderAt).getTime()) / 60000)
          )
        : 720;

  const ipMismatchFlag =
    user.trustedIpAddress && user.trustedIpAddress !== ipAddress ? 1 : 0;
  const deviceTypeEncoded = encodeDeviceType(deviceType);

  const mlPayload = {
    transaction_amount: Number(amount),
    time_since_last_order: computedTimeSinceLastOrder,
    ip_mismatch_flag: ipMismatchFlag,
    device_type_encoded: deviceTypeEncoded,
    historical_fraud_count: user.historicalFraudCount
  };

  const mlResponse = await predictFraud(mlPayload);
  const riskScore = Number(mlResponse.fraud_probability_score.toFixed(2));
  const resolvedStatus = resolveBackendDecision(riskScore);
  const resolvedRiskLevel = getRiskLevelFromScore(riskScore);

  const transaction = await Transaction.create({
    transactionId: buildTransactionId(),
    user: user._id,
    userId: user.userId,
    amount: Number(amount),
    ipAddress,
    status: resolvedStatus,
    riskScore,
    riskLevel: resolvedRiskLevel,
    recommendedAction: mlResponse.recommended_action,
    deviceType,
    features: {
      transactionAmount: mlPayload.transaction_amount,
      timeSinceLastOrder: mlPayload.time_since_last_order,
      ipMismatchFlag: mlPayload.ip_mismatch_flag,
      deviceTypeEncoded: mlPayload.device_type_encoded,
      historicalFraudCount: mlPayload.historical_fraud_count
    },
    mlResponse: {
      fraudProbabilityScore: riskScore,
      modelRiskLevel: mlResponse.risk_level,
      modelRecommendedAction: mlResponse.recommended_action
    }
  });

  user.lastOrderAt = new Date();

  if (!user.trustedIpAddress) {
    user.trustedIpAddress = ipAddress;
  }

  if (resolvedStatus === "BLOCK") {
    user.accountStatus = "flagged";
    user.historicalFraudCount += 1;
  }

  await user.save();

  if (resolvedStatus !== "ALLOW") {
    await FraudLog.create({
      transaction: transaction._id,
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      eventType: "ML_SCREENING",
      status: resolvedStatus,
      riskScore,
      riskLevel: resolvedRiskLevel,
      reason: `ML screening marked this checkout as ${resolvedStatus}.`,
      metadata: {
        mlPayload,
        mlResponse
      }
    });
  }

  res.status(201).json({
    message:
      resolvedStatus === "ALLOW"
        ? "Checkout approved."
        : resolvedStatus === "REVIEW"
          ? "Transaction queued for review."
          : "Transaction blocked due to fraud risk.",
    transaction
  });
});
