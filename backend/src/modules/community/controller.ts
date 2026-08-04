import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { CommunityMember } from "../../models/CommunityMember";
import { config } from "../../config/env";
import { AuthRequest } from "../../middleware/auth";

cloudinary.config({
  cloudinary_url: config.cloudinaryUrl,
});

export const getMembers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query (active members only, plus optional search)
    const query: any = { status: "active" };
    const search = req.query.search as string;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    const [members, total] = await Promise.all([
      CommunityMember.find(query)
        .select("-password -__v") // Exclude sensitive/internal fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityMember.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        members,
        pagination: {
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error in getMembers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const member = await CommunityMember.findOne({
      email: email.toLowerCase(),
    });

    if (!member) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (member.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, member.password || "");
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: member._id, email: member.email, role: "community" },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    console.error("Community login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.member?.id;
    if (!memberId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { bio, linkedin, instagram, phone } = req.body;

    const updatedMember = await CommunityMember.findByIdAndUpdate(
      memberId,
      { $set: { bio, linkedin, instagram, phone } },
      { new: true, runValidators: true },
    ).select("-password -__v");

    if (!updatedMember) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    return res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.member?.id;
    if (!memberId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const photoUrl = req.file.path; // multer-storage-cloudinary provides path

    const updatedMember = await CommunityMember.findByIdAndUpdate(
      memberId,
      { $set: { photoUrl } },
      { new: true },
    ).select("-password -__v");

    return res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    console.error("Upload photo error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
