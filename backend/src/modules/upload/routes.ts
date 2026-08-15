/**
 * @file routes.ts
 * @description Router for handling image uploads.
 * @architecture Provides endpoints for uploading files to Cloudinary using multer middleware.
 */

import express from "express";
import { upload } from "../../config/cloudinary";
import { uploadImage } from "./controller";

const router = express.Router();

// The "image" field is expected in the multipart/form-data request
router.post("/", upload.single("image"), uploadImage);

/**
 * @module UploadRoutes
 * @description Routes for uploading media assets.
 */
export default router;
