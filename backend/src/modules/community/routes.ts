import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  getMembers,
  login,
  logout,
  updateProfile,
  uploadPhoto,
  getMe,
} from "./controller";
import { checkoutCard, paymentRedirect, getOrderDetails } from "./card.controller";
import {
  requireCommunityAuth,
  optionalCommunityAuth,
} from "../../middleware/auth";

const router = Router();

import { CommunityMember } from "../../models/CommunityMember";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    let public_id = "profile_" + Date.now();
    try {
      if (req.member?.id) {
        const member = await CommunityMember.findById(req.member.id);
        if (member) {
          const rawName = member.name || "user";
          const rawRole = member.role || "";
          const slug = `${rawName}-${rawRole}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
            
          // We add a random number to prevent overwriting if two people 
          // share the same name/role, or if they upload multiple times.
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          public_id = slug ? `${slug}-${randomSuffix}` : public_id;
        }
      }
    } catch (err) {
      console.error("Error generating public_id:", err);
    }

    return {
      folder: "business_orbit_profiles",
      allowed_formats: ["jpg", "png", "jpeg"],
      transformation: [{ width: 400, height: 400, crop: "fill" }],
      public_id: public_id,
      unique_filename: false, // We handle uniqueness manually with our random suffix
    };
  },
});
const parser = multer({ storage });

router.get("/members", requireCommunityAuth as any, getMembers as any);
router.get("/me", requireCommunityAuth as any, getMe as any);
router.post("/login", login);
router.post("/logout", logout);
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
router.get("/card/order/:orderId", getOrderDetails as any);

export default router;
