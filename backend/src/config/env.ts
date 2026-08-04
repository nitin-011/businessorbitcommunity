import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || "8001",
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "business_orbit",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
  adminEmail: process.env.ADMIN_EMAIL || "admin@businessorbit.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  senderEmail: process.env.SENDER_EMAIL || "noreply@businessorbit.com",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:8001",
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  phonepeMerchantId:
    process.env.PHONEPE_MERCHANT_ID || "PLACEHOLDER_MERCHANT_ID",
  phonepeClientId: process.env.PHONEPE_CLIENT_ID || "",
  phonepeClientSecret: process.env.PHONEPE_CLIENT_SECRET || "",
  phonepeClientVersion: process.env.PHONEPE_CLIENT_VERSION || "1",
  phonepeEnv: process.env.PHONEPE_ENV || "UAT",
};

if (!config.jwtSecret) {
  console.error("❌ JWT_SECRET is required in .env file");
  process.exit(1);
}
