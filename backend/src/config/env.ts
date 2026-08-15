/**
 * @file env.ts
 * @description Centralized environment variable configuration.
 * @architecture Parses, validates, and exports environment variables as a typed configuration object.
 */
import dotenv from "dotenv";

dotenv.config();

/**
 * @constant {Object} config
 * @description Global configuration object containing validated environment variables
 */
export const config = {
  port: process.env.PORT || "8001",
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "business_orbit",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
  adminEmail: process.env.ADMIN_EMAIL || "admin@businessorbit.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  senderEmail: process.env.SENDER_EMAIL || "noreply@businessorbit.com",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:8001",
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  phonepeMerchantId:
    process.env.PHONEPE_MERCHANT_ID || "PLACEHOLDER_MERCHANT_ID",
  phonepeClientId: process.env.PHONEPE_CLIENT_ID || "",
  phonepeClientSecret: process.env.PHONEPE_CLIENT_SECRET || "",
  phonepeClientVersion: process.env.PHONEPE_CLIENT_VERSION || "1",
  phonepeEnv: process.env.PHONEPE_ENV || "UAT",
};

config.jwtSecret = config.jwtSecret.trim();

if (!config.jwtSecret || config.jwtSecret === "your_jwt_secret_here") {
  console.error(
    "❌ JWT_SECRET is required and must not be the placeholder 'your_jwt_secret_here' in .env file",
  );
  process.exit(1);
}

if (config.jwtSecret.length < 32) {
  console.error(
    "❌ JWT_SECRET must be at least 32 characters long for security",
  );
  process.exit(1);
}
