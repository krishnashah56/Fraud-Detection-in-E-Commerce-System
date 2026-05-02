import FraudLog from "../models/FraudLog.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeReviewStatus } from "../services/fraudDecisionService.js";
import { analyzeDatasetBuffer } from "../services/datasetAnalysisService.js";

const fraudStatuses = ["BLOCK", "REJECTED", "REVIEW"];
const blockedStatuses = ["BLOCK", "REJECTED"];
const legitimateStatuses = ["ALLOW", "APPROVED"];

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalTransactions,
    blockedTransactions,
    pendingReview,
    fraudCount,
    legitimateCount,
    lossAvertedResult,
    alerts,
    logs,
    hourlyTrendResults
  ] = await Promise.all([
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: { $in: blockedStatuses } }),
    Transaction.countDocuments({ status: "REVIEW" }),
    Transaction.countDocuments({ status: { $in: fraudStatuses } }),
    Transaction.countDocuments({ status: { $in: legitimateStatuses } }),
    Transaction.aggregate([
      { $match: { status: { $in: blockedStatuses } } },
      { $group: { _id: null, lossAverted: { $sum: "$amount" } } }
    ]),
    Transaction.find({ riskScore: { $gte: 85 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("transactionId userId amount ipAddress riskScore status riskLevel createdAt"),
    FraudLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("transactionId userId status riskScore reason createdAt"),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $project: {
          hour: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00.000Z",
              date: "$createdAt"
            }
          },
          status: 1,
          amount: 1
        }
      },
      {
        $group: {
          _id: "$hour",
          total: { $sum: 1 },
          fraud: {
            $sum: {
              $cond: [{ $in: ["$status", fraudStatuses] }, 1, 0]
            }
          },
          lossAverted: {
            $sum: {
              $cond: [{ $in: ["$status", blockedStatuses] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const lossAverted = lossAvertedResult?.[0]?.lossAverted ?? 0;
  const hourlyTrend = hourlyTrendResults.map((item) => ({
    hour: item._id,
    total: item.total,
    fraud: item.fraud,
    lossAverted: item.lossAverted
  }));

  res.json({
    stats: {
      totalTransactions,
      blockedTransactions,
      pendingReview,
      fraudRate: totalTransactions ? Number(((fraudCount / totalTransactions) * 100).toFixed(1)) : 0,
      lossAverted: Number(lossAverted.toFixed(2))
    },
    chartData: [
      { name: "Fraud + Review", value: fraudCount },
      { name: "Legitimate", value: legitimateCount }
    ],
    hourlyTrend,
    alerts,
    recentFraudLogs: logs
  });
});

export const getRecentTransactions = asyncHandler(async (req, res) => {
  const { search, dateFrom, dateTo } = req.query;
  const filters = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filters.$or = [
      { transactionId: searchRegex },
      { userId: searchRegex },
      { ipAddress: searchRegex }
    ];
  }

  if (dateFrom || dateTo) {
    filters.createdAt = {};

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!Number.isNaN(fromDate.getTime())) {
        filters.createdAt.$gte = fromDate;
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!Number.isNaN(toDate.getTime())) {
        filters.createdAt.$lte = toDate;
      }
    }
  }

  const transactions = await Transaction.find(filters)
    .sort({ createdAt: -1 })
    .limit(100)
    .select(
      "transactionId userId amount ipAddress riskScore status riskLevel deviceType features createdAt reviewedBy reviewedAt"
    );

  const results = transactions.map((transaction) => {
    const reasonCodes = [];

    if (transaction.features?.ipMismatchFlag) {
      reasonCodes.push("IP mismatch");
    }

    if (transaction.features?.historicalFraudCount > 0) {
      reasonCodes.push("Past fraud history");
    }

    if (transaction.amount >= 1500) {
      reasonCodes.push("Large amount");
    }

    if (transaction.deviceType === "desktop" && transaction.features?.ipMismatchFlag) {
      reasonCodes.push("Unfamiliar network");
    }

    if (!reasonCodes.length) {
      reasonCodes.push("Standard scoring");
    }

    return {
      ...transaction.toObject(),
      reasonCodes,
      vpnSuspected: Boolean(transaction.features?.ipMismatchFlag)
    };
  });

  res.json({ transactions: results });
});

export const bulkReviewTransactions = asyncHandler(async (req, res) => {
  const { transactionIds, action, reviewedBy = "admin@dashboard.local" } = req.body;

  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    const error = new Error("transactionIds must be a non-empty array.");
    error.statusCode = 400;
    throw error;
  }

  const nextStatus = normalizeReviewStatus(action);

  if (!nextStatus) {
    const error = new Error("action must be APPROVE or REJECT.");
    error.statusCode = 400;
    throw error;
  }

  const transactions = await Transaction.find({
    transactionId: { $in: transactionIds },
    status: "REVIEW"
  });

  const updatedIds = [];

  for (const transaction of transactions) {
    transaction.status = nextStatus;
    transaction.reviewedBy = reviewedBy;
    transaction.reviewedAt = new Date();
    await transaction.save();

    if (nextStatus === "REJECTED") {
      await User.findOneAndUpdate(
        { userId: transaction.userId },
        {
          $inc: { historicalFraudCount: 1 },
          $set: { accountStatus: "flagged" }
        }
      );
    }

    await FraudLog.create({
      transaction: transaction._id,
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      eventType: "ADMIN_REVIEW",
      status: nextStatus,
      riskScore: transaction.riskScore,
      riskLevel: transaction.riskLevel,
      reason:
        nextStatus === "APPROVED"
          ? "Admin approved a batch of review transactions."
          : "Admin rejected a batch of review transactions.",
      metadata: {
        reviewedBy,
        action
      }
    });

    updatedIds.push(transaction.transactionId);
  }

  res.json({
    message: `${updatedIds.length} review transactions updated successfully.`,
    updatedTransactionIds: updatedIds
  });
});

export const getFraudLogs = asyncHandler(async (_req, res) => {
  const logs = await FraudLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .select("transactionId userId eventType status riskScore riskLevel reason createdAt");

  res.json({ logs });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .select(
      "userId name email role accountStatus trustedIpAddress defaultDeviceType historicalFraudCount lastOrderAt createdAt"
    );

  res.json({ users });
});

export const reviewTransaction = asyncHandler(async (req, res) => {
  const { transactionId, action, reviewedBy = "admin@dashboard.local", reviewNotes = "" } = req.body;

  if (!transactionId || !action) {
    const error = new Error("transactionId and action are required.");
    error.statusCode = 400;
    throw error;
  }

  const nextStatus = normalizeReviewStatus(action);

  if (!nextStatus) {
    const error = new Error("action must be APPROVE or REJECT.");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findOne({ transactionId });

  if (!transaction) {
    const error = new Error(`Transaction ${transactionId} was not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (transaction.status !== "REVIEW") {
    const error = new Error("Only transactions in REVIEW status can be updated.");
    error.statusCode = 400;
    throw error;
  }

  transaction.status = nextStatus;
  transaction.reviewedBy = reviewedBy;
  transaction.reviewNotes = reviewNotes;
  transaction.reviewedAt = new Date();
  await transaction.save();

  if (nextStatus === "REJECTED") {
    await User.findOneAndUpdate(
      { userId: transaction.userId },
      {
        $inc: { historicalFraudCount: 1 },
        $set: { accountStatus: "flagged" }
      }
    );
  }

  await FraudLog.create({
    transaction: transaction._id,
    transactionId: transaction.transactionId,
    userId: transaction.userId,
    eventType: "ADMIN_REVIEW",
    status: nextStatus,
    riskScore: transaction.riskScore,
    riskLevel: transaction.riskLevel,
    reason:
      nextStatus === "APPROVED"
        ? "Admin approved a previously held transaction."
        : "Admin rejected a high-risk transaction after review.",
    metadata: {
      reviewedBy,
      reviewNotes
    }
  });

  res.json({
    message: `Transaction ${transaction.transactionId} marked as ${nextStatus}.`,
    transaction
  });
});

export const analyzeDataset = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    const error = new Error("Upload a CSV or XLSX dataset file in the dataset field.");
    error.statusCode = 400;
    throw error;
  }

  const result = await analyzeDatasetBuffer(req.file.buffer, req.file.originalname);

  res.json({
    message: "Dataset analyzed successfully.",
    result
  });
});
