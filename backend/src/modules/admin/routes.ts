/**
 * @file routes.ts
 * @description Defines routing for the admin domain.
 * @architecture Integrates admin controller handlers with Express routing, protected by admin-level authentication.
 */

import { Router } from "express";
import {
  getStats,
  getBusiness,
  approve,
  reject,
  sendBulk,
  getOrders,
  exportOrders,
  getCommunityMembers,
} from "./controller";
import { authMiddleware } from "../../middleware/auth";

/**
 * @constant {Router} router
 * @description Express router for admin-facing endpoints
 */
const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

router.get("/stats", getStats);
router.get("/business", getBusiness);
router.get("/community-members", getCommunityMembers);
router.patch("/approve/:type/:id", approve);
router.patch("/reject/:type/:id", reject);
router.post("/bulk-email", sendBulk);

// Orbit Card Fulfillment
router.get("/orders", getOrders);
router.get("/orders/export", exportOrders);

/**
 * @module AdminRoutes
 * @description Admin routes for business applications, community members, and orders.
 */
export default router;
