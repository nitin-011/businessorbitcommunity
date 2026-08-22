/**
 * @file controller.ts
 * @description Authentication module controllers for admin login, logout, and token refresh.
 * @architecture Implements the admin auth logic, issuing JWT tokens and enforcing brute force protection using LoginAttempt.
 */
import { Request, Response } from "express";
import { Admin } from "../../models/Admin";
import { LoginAttempt } from "../../models/LoginAttempt";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt";
import { config } from "../../config/env";
import fs from "fs";
import path from "path";

/**
 * @desc    Authenticate admin and return access token in cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    // Create a unique identifier combining IP and email to mitigate targeted brute-force attacks
    const identifier = `${req.ip}:${normalizedEmail}`;

    // Check brute force protection
    // 1. Check if this IP/Email combination is currently locked out
    const loginAttempt = await LoginAttempt.findOne({ identifier });
    if (loginAttempt?.lockedUntil && new Date() < loginAttempt.lockedUntil) {
      res
        .status(429)
        .json({ message: "Too many failed attempts. Try again later." });
      return;
    }

    // 2. Look up the admin. We explicitly select the password hash since it is excluded by default in the schema
    const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
    if (!admin) {
      // Increment failed attempts
      await incrementFailedAttempts(identifier);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      await incrementFailedAttempts(identifier);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Clear failed attempts on successful login
    // 4. Authentication succeeded: clear any existing failed attempt trackers
    await LoginAttempt.deleteOne({ identifier });

    const token = generateAccessToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    // Determine if the connection is secure (useful when behind proxies like Nginx or AWS ELB)
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (unified with community)
    });

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc    Increments the failed login attempt counter for an IP/email
 * @param   {string} identifier - IP address or email
 * @returns {Promise<void>}
 */
const incrementFailedAttempts = async (identifier: string): Promise<void> => {
  const attempt = await LoginAttempt.findOne({ identifier });

  if (!attempt) {
    await LoginAttempt.create({
      identifier,
      attempts: 1,
      lastAttempt: new Date(),
    });
  } else {
    const newAttempts = attempt.attempts + 1;
    const update: any = {
      attempts: newAttempts,
      lastAttempt: new Date(),
    };

    if (newAttempts >= 5) {
      update.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }

    await LoginAttempt.updateOne({ identifier }, update);
  }
};

/**
 * @desc    Log out admin by clearing the access token cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // Determine if the connection is secure (useful when behind proxies like Nginx or AWS ELB)
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
  };
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logout successful" });
};

/**
 * @desc    Get current authenticated admin's details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    res.json({
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc    Refresh the admin's access token using the existing valid token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(401).json({ message: "Admin not found" });
      return;
    }

    const accessToken = generateAccessToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    // Determine if the connection is secure (useful when behind proxies like Nginx or AWS ELB)
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
