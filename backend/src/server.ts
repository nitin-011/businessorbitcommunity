/**
 * @file server.ts
 * @description Application entry point and Express server configuration.
 * @architecture Bootstraps the Express application, configures global middleware, registers route modules, and connects to the database.
 */
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/database";
import { config } from "./config/env";

import authRoutes from "./modules/auth/routes";
import businessRoutes from "./modules/business/routes";
import adminRoutes from "./modules/admin/routes";
import communityRoutes from "./modules/community/routes";
import uploadRoutes from "./modules/upload/routes";

dotenv.config();

/**
 * @constant {express.Application} app
 * @description Main Express application instance
 */
const app = express();

// Trust reverse proxy (e.g., ngrok, nginx) so rate limiters can correctly read X-Forwarded-For
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // If CORS_ORIGINS is set to "*", allow all origins
      if (config.corsOrigins.includes("*")) return callback(null, true);

      // Check if the origin is in the allowed list (ignoring trailing slashes)
      const isAllowed = config.corsOrigins.some(
        (allowedOrigin) =>
          origin === allowedOrigin ||
          origin === allowedOrigin.replace(/\/$/, ""),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", service: "business-orbit-api" });
});

// Root route
app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Business Orbit API" });
});

// Start server
/**
 * @desc    Initializes database connections and starts the Express server
 * @returns {Promise<void>} Resolves when the server is listening
 */
const startServer = async () => {
  try {
    await connectDatabase();

    const port = config.port;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

/**
 * @module app
 * @description Configured Express application instance for testing and serverless deployment
 */
export default app;
