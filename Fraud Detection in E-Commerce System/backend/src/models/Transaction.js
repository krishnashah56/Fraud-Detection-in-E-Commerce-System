import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    ipAddress: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["ALLOW", "BLOCK", "REVIEW", "APPROVED", "REJECTED"],
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    recommendedAction: {
      type: String,
      enum: ["ALLOW", "REVIEW", "BLOCK"],
      required: true
    },
    deviceType: {
      type: String,
      default: "desktop"
    },
    features: {
      transactionAmount: Number,
      timeSinceLastOrder: Number,
      ipMismatchFlag: Number,
      deviceTypeEncoded: Number,
      historicalFraudCount: Number
    },
    mlResponse: {
      fraudProbabilityScore: Number,
      modelRiskLevel: String,
      modelRecommendedAction: String
    },
    reviewedBy: {
      type: String,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewNotes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Transaction", transactionSchema);
