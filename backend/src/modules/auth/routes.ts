/**
 * @file routes.ts
 * @description Authentication router for logging in, logging out, and token management.
 * @architecture Exposes endpoints for session creation and verification using rate limiting and auth middlewares.
 */

import { Router } from "express";
import { login, logout, getMe, refresh } from "./controller";
import { authMiddleware } from "../../middleware/auth";
import { loginLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refresh);

/**
 * @module AuthRoutes
 * @description Public and private authentication routes.
 */
export default router;
