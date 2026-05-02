import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    usernameAttempted: {
      type: String,
      required: true,
      trim: true
    },
    success: {
      type: Boolean,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "login"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model("SecurityLog", securityLogSchema);
