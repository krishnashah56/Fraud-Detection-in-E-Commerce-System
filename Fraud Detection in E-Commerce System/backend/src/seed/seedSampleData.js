import dotenv from "dotenv";

import connectDatabase from "../config/db.js";
import FraudLog from "../models/FraudLog.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    userId: "USR-1001",
    name: "Ariana Flores",
    email: "ariana.flores@example.com",
    trustedIpAddress: "103.44.22.11",
    defaultDeviceType: "desktop",
    historicalFraudCount: 0,
    lastOrderAt: new Date(Date.now() - 180 * 60000)
  },
  {
    userId: "USR-1002",
    name: "Marcus Lee",
    email: "marcus.lee@example.com",
    trustedIpAddress: "49.205.90.13",
    defaultDeviceType: "mobile",
    historicalFraudCount: 2,
    accountStatus: "flagged",
    lastOrderAt: new Date(Date.now() - 20 * 60000)
  },
  {
    userId: "USR-1003",
    name: "Nina Patel",
    email: "nina.patel@example.com",
    trustedIpAddress: "182.74.11.4",
    defaultDeviceType: "tablet",
    historicalFraudCount: 1,
    lastOrderAt: new Date(Date.now() - 45 * 60000)
  },
  {
    userId: "USR-1004",
    name: "David Chen",
    email: "david.chen@example.com",
    trustedIpAddress: "125.19.87.54",
    defaultDeviceType: "desktop",
    historicalFraudCount: 0,
    lastOrderAt: new Date(Date.now() - 720 * 60000)
  }
];

const transactions = [
  {
    transactionId: "TXN-SAMPLE-0001",
    userId: "USR-1001",
    amount: 145.5,
    ipAddress: "103.44.22.11",
    status: "ALLOW",
    riskScore: 18,
    riskLevel: "LOW",
    recommendedAction: "ALLOW",
    deviceType: "desktop",
    features: {
      transactionAmount: 145.5,
      timeSinceLastOrder: 180,
      ipMismatchFlag: 0,
      deviceTypeEncoded: 0,
      historicalFraudCount: 0
    },
    mlResponse: {
      fraudProbabilityScore: 18,
      modelRiskLevel: "LOW",
      modelRecommendedAction: "ALLOW"
    },
    createdAt: new Date(Date.now() - 140 * 60000)
  },
  {
    transactionId: "TXN-SAMPLE-0002",
    userId: "USR-1002",
    amount: 1840,
    ipAddress: "88.12.45.90",
    status: "BLOCK",
    riskScore: 94,
    riskLevel: "CRITICAL",
    recommendedAction: "BLOCK",
    deviceType: "mobile",
    features: {
      transactionAmount: 1840,
      timeSinceLastOrder: 12,
      ipMismatchFlag: 1,
      deviceTypeEncoded: 1,
      historicalFraudCount: 2
    },
    mlResponse: {
      fraudProbabilityScore: 94,
      modelRiskLevel: "CRITICAL",
      modelRecommendedAction: "BLOCK"
    },
    createdAt: new Date(Date.now() - 95 * 60000)
  },
  {
    transactionId: "TXN-SAMPLE-0003",
    userId: "USR-1003",
    amount: 620.25,
    ipAddress: "182.74.11.4",
    status: "REVIEW",
    riskScore: 77,
    riskLevel: "HIGH",
    recommendedAction: "REVIEW",
    deviceType: "tablet",
    features: {
      transactionAmount: 620.25,
      timeSinceLastOrder: 45,
      ipMismatchFlag: 0,
      deviceTypeEncoded: 2,
      historicalFraudCount: 1
    },
    mlResponse: {
      fraudProbabilityScore: 77,
      modelRiskLevel: "HIGH",
      modelRecommendedAction: "REVIEW"
    },
    createdAt: new Date(Date.now() - 65 * 60000)
  },
  {
    transactionId: "TXN-SAMPLE-0004",
    userId: "USR-1004",
    amount: 340,
    ipAddress: "125.19.87.54",
    status: "APPROVED",
    riskScore: 59,
    riskLevel: "MEDIUM",
    recommendedAction: "REVIEW",
    deviceType: "desktop",
    features: {
      transactionAmount: 340,
      timeSinceLastOrder: 720,
      ipMismatchFlag: 0,
      deviceTypeEncoded: 0,
      historicalFraudCount: 0
    },
    mlResponse: {
      fraudProbabilityScore: 59,
      modelRiskLevel: "MEDIUM",
      modelRecommendedAction: "REVIEW"
    },
    reviewedBy: "admin@dashboard.local",
    reviewedAt: new Date(Date.now() - 20 * 60000),
    createdAt: new Date(Date.now() - 30 * 60000)
  },
  {
    transactionId: "TXN-SAMPLE-0005",
    userId: "USR-1002",
    amount: 2999,
    ipAddress: "176.8.55.201",
    status: "REJECTED",
    riskScore: 91,
    riskLevel: "CRITICAL",
    recommendedAction: "BLOCK",
    deviceType: "mobile",
    features: {
      transactionAmount: 2999,
      timeSinceLastOrder: 8,
      ipMismatchFlag: 1,
      deviceTypeEncoded: 1,
      historicalFraudCount: 3
    },
    mlResponse: {
      fraudProbabilityScore: 91,
      modelRiskLevel: "CRITICAL",
      modelRecommendedAction: "BLOCK"
    },
    reviewedBy: "admin@dashboard.local",
    reviewedAt: new Date(Date.now() - 8 * 60000),
    createdAt: new Date(Date.now() - 15 * 60000)
  },
  {
    transactionId: "TXN-SAMPLE-0006",
    userId: "USR-1001",
    amount: 88.4,
    ipAddress: "103.44.22.11",
    status: "ALLOW",
    riskScore: 12,
    riskLevel: "LOW",
    recommendedAction: "ALLOW",
    deviceType: "desktop",
    features: {
      transactionAmount: 88.4,
      timeSinceLastOrder: 95,
      ipMismatchFlag: 0,
      deviceTypeEncoded: 0,
      historicalFraudCount: 0
    },
    mlResponse: {
      fraudProbabilityScore: 12,
      modelRiskLevel: "LOW",
      modelRecommendedAction: "ALLOW"
    },
    createdAt: new Date(Date.now() - 5 * 60000)
  }
];

const fraudLogs = [
  {
    transactionId: "TXN-SAMPLE-0002",
    userId: "USR-1002",
    eventType: "ML_SCREENING",
    status: "BLOCK",
    riskScore: 94,
    riskLevel: "CRITICAL",
    reason: "ML screening marked this checkout as BLOCK."
  },
  {
    transactionId: "TXN-SAMPLE-0003",
    userId: "USR-1003",
    eventType: "ML_SCREENING",
    status: "REVIEW",
    riskScore: 77,
    riskLevel: "HIGH",
    reason: "ML screening marked this checkout as REVIEW."
  },
  {
    transactionId: "TXN-SAMPLE-0005",
    userId: "USR-1002",
    eventType: "ADMIN_REVIEW",
    status: "REJECTED",
    riskScore: 91,
    riskLevel: "CRITICAL",
    reason: "Admin rejected a high-risk transaction after review."
  }
];

const seed = async () => {
  await connectDatabase(process.env.MONGODB_URI);

  await Promise.all([
    FraudLog.deleteMany({}),
    Transaction.deleteMany({}),
    User.deleteMany({})
  ]);

  const createdUsers = await User.insertMany(users);
  const userMap = new Map(createdUsers.map((user) => [user.userId, user]));

  const createdTransactions = await Transaction.insertMany(
    transactions.map((transaction) => ({
      ...transaction,
      user: userMap.get(transaction.userId)._id
    }))
  );
  const transactionMap = new Map(
    createdTransactions.map((transaction) => [transaction.transactionId, transaction])
  );

  await FraudLog.insertMany(
    fraudLogs.map((log) => ({
      ...log,
      transaction: transactionMap.get(log.transactionId)._id
    }))
  );

  console.log("Sample users, transactions, and fraud logs inserted.");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
