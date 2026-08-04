import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { getMembers, login, updateProfile, uploadPhoto, getMe } from "./controller";
import { checkoutCard, paymentRedirect } from "./card.controller";
import {
  requireCommunityAuth,
  optionalCommunityAuth,
} from "../../middleware/auth";

const router = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "business_orbit_profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  } as any,
});
const parser = multer({ storage });

router.get("/members", requireCommunityAuth as any, getMembers as any);
router.get("/me", requireCommunityAuth as any, getMe as any);
router.post("/login", login);
router.put("/profile", requireCommunityAuth as any, updateProfile as any);
router.post(
  "/profile/photo",
  requireCommunityAuth as any,
  parser.single("photo"),
  uploadPhoto as any,
);
router.post(
  "/card/checkout",
  optionalCommunityAuth as any,
  checkoutCard as any,
);
router.all("/card/payment-status", paymentRedirect as any);

export default router;
