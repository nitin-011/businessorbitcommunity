/**
 * @file database.ts
 * @description Database connection configuration.
 * @architecture Manages the Mongoose connection lifecycle to the MongoDB instance.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * @desc    Establishes a connection to the MongoDB database
 * @returns {Promise<void>} Resolves when the connection is successful
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production" && !process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing in production");
    }
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
    const dbName = process.env.DB_NAME || "business_orbit";

    await mongoose.connect(mongoUrl, {
      dbName: dbName,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * @module mongoose
 * @description Configured mongoose instance
 */
export default mongoose;
