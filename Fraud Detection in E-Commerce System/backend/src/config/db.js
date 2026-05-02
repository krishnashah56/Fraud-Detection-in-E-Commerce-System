import mongoose from "mongoose";

const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from the backend environment.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

export default connectDatabase;
