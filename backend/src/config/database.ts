import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDatabase = async (): Promise<void> => {
  try {
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

export default mongoose;
