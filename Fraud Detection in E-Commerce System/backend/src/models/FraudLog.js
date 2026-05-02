import mongoose from "mongoose";

const fraudLogSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      enum: ["ML_SCREENING", "ADMIN_REVIEW"],
      required: true
    },
    status: {
      type: String,
      required: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("FraudLog", fraudLogSchema);
