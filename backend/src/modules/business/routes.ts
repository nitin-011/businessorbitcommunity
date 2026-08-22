/**
 * @file routes.ts
 * @description Router for business application operations.
 * @architecture Provides endpoints for public business applications and admin-level approval workflows.
 */

import { Router } from "express";
import { apply } from "./controller";

/**
 * @constant {Router} router
 * @description Express router for business application endpoints
 */
const router = Router();

router.post("/apply", apply);

/**
 * @module BusinessRoutes
 * @description Routes for handling business applications.
 */
export default router;
