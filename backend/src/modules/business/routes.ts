/**
 * @file routes.ts
 * @description Router for business application operations.
 * @architecture Provides endpoints for public business applications and admin-level approval workflows.
 */

import { Router } from "express";
import { apply, adminApprove } from "./controller";

const router = Router();

router.post("/apply", apply);
router.post("/admin/approve/:id", adminApprove);

/**
 * @module BusinessRoutes
 * @description Routes for handling business applications.
 */
export default router;
