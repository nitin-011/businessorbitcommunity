import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import { config } from "./config/env";


import authRoutes from "./modules/auth/routes";
import businessRoutes from "./modules/business/routes";
import adminRoutes from "./modules/admin/routes";
import communityRoutes from "./modules/community/routes";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed list (ignoring trailing slashes)
      const isAllowed = config.corsOrigins.some(
        (allowedOrigin) =>
          origin === allowedOrigin ||
          origin === allowedOrigin.replace(/\/$/, "") ||
          allowedOrigin === "*",
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", service: "business-orbit-api" });
});

// Root route
app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Business Orbit API" });
});

// Start server
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

startServer();
