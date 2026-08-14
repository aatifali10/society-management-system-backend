import mongoose from "mongoose";

const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/society-management";

export const isMongoConnected = { value: false };

export default async function connectDatabase() {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isMongoConnected.value = true;
    console.log("MongoDB connected successfully.");
    return true;
  } catch (error) {
    isMongoConnected.value = false;
    console.warn(
      "MongoDB not available, starting backend with in-memory user store for auth testing.",
      error.message,
    );
    return false;
  }
}
