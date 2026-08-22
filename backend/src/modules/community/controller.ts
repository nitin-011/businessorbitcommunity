/**
 * @file controller.ts
 * @description Community module controllers for managing member profiles, authentication, and directory listing.
 * @architecture Implements the community-facing logic, authenticating members via JWT, and integrating with Cloudinary for photo uploads.
 */
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyPassword } from "../../utils/password";
import { v2 as cloudinary } from "cloudinary";
import { CommunityMember } from "../../models/CommunityMember";
import { config } from "../../config/env";
import { AuthRequest } from "../../middleware/auth";

cloudinary.config({
  cloudinary_url: config.cloudinaryUrl,
});

/**
 * @desc    Get a paginated list of active community members with optional search
 * @route   GET /api/community/members
 * @access  Private (Community Member)
 */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query (active members only, plus optional search)
    const query: any = { status: "active" };
    const search = req.query.search as string;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { role: { $regex: escapedSearch, $options: "i" } },
        { bio: { $regex: escapedSearch, $options: "i" } },
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

/**
 * @desc    Authenticate a community member using email/username and return a JWT cookie
 * @route   POST /api/community/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password required",
      });
    }

    // Support authenticating via either email or username
    const query = email
      ? { email: email.trim().toLowerCase() }
      : { username: username.trim().toLowerCase() };

    const member = await CommunityMember.findOne(query).select("+password");

    if (!member) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Guard clause: Prevent suspended or inactive members from authenticating
    if (member.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    const isMatch = await verifyPassword(password, member.password || "");
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Issue a 7-day JWT access token containing essential identity claims
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

/**
 * @desc    Log out a community member by clearing the JWT cookie
 * @route   POST /api/community/logout
 * @access  Public
 */
export const logout = async (req: Request, res: Response) => {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
  });
  return res.status(200).json({ success: true, message: "Logout successful" });
};

/**
 * @desc    Update the authenticated member's profile information
 * @route   PUT /api/community/profile
 * @access  Private (Community Member)
 */
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

/**
 * @desc    Upload and update the authenticated member's profile photo
 * @route   POST /api/community/profile/photo
 * @access  Private (Community Member)
 */
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

/**
 * @desc    Get the current authenticated member's profile details
 * @route   GET /api/community/me
 * @access  Private (Community Member)
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.member?.id;
    if (!memberId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const member =
      await CommunityMember.findById(memberId).select("-password -__v");
    if (!member)
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    if (member.status !== "active")
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    console.error("Get me error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
