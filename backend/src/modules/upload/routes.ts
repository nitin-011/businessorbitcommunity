import express from "express";
import { upload } from "../../config/cloudinary";
import { uploadImage } from "./controller";

const router = express.Router();

// The "image" field is expected in the multipart/form-data request
router.post("/", upload.single("image"), uploadImage);

export default router;
