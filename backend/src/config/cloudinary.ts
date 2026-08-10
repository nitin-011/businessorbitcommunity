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

export const upload = multer({ storage: storage });
export { cloudinary };
