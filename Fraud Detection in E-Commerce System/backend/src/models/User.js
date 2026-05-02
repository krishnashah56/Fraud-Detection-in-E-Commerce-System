import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      default: "customer"
    },
    accountStatus: {
      type: String,
      enum: ["active", "flagged", "blocked"],
      default: "active"
    },
    trustedIpAddress: {
      type: String,
      default: ""
    },
    defaultDeviceType: {
      type: String,
      default: "desktop"
    },
    historicalFraudCount: {
      type: Number,
      default: 0
    },
    lastOrderAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);
