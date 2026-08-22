/**
 * @file routes.ts
 * @description Router for handling image uploads.
 * @architecture Provides endpoints for uploading files to Cloudinary using multer middleware.
 */

import express from "express";
import { upload } from "../../config/cloudinary";
import { uploadImage } from "./controller";
import { authenticate } from "../../middleware/auth";

/**
 * @constant {Router} router
 * @description Express router for file upload endpoints
 */
const router = express.Router();

// The "image" field is expected in the multipart/form-data request
router.post("/", authenticate(["admin", "community"]), upload.single("image"), uploadImage);

/**
 * @module UploadRoutes
 * @description Routes for uploading media assets.
 */
export default router;
