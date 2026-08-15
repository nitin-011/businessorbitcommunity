/**
 * @file cloudinary.ts
 * @description Configuration for the Cloudinary media storage service.
 * @architecture Configures the cloudinary SDK and a multer storage engine for handling file uploads.
 */
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "./env";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    return {
      folder: "businessorbit/uploads", // The folder in cloudinary
      format: "jpeg", // supports promises as well
      public_id: `${file.fieldname}-${uniqueSuffix}`,
    };
  },
});

/**
 * @constant {Object} upload
 * @description Multer middleware configured with Cloudinary storage
 */
export const upload = multer({ storage: storage });
/**
 * @module cloudinary
 * @description Configured Cloudinary SDK instance
 */
export { cloudinary };
