import { Request, Response } from "express";
import { Admin } from "../../models/Admin";
import { LoginAttempt } from "../../models/LoginAttempt";
import { hashPassword, verifyPassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../../utils/jwt";
import { config } from "../../config/env";
import fs from "fs";
import path from "path";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const identifier = `${req.ip}:${normalizedEmail}`;

    // Check brute force protection
    const loginAttempt = await LoginAttempt.findOne({ identifier });
    if (loginAttempt?.lockedUntil && new Date() < loginAttempt.lockedUntil) {
      res
        .status(429)
        .json({ message: "Too many failed attempts. Try again later." });
      return;
    }

    const admin = await Admin.findOne({ email: normalizedEmail });
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
    await LoginAttempt.deleteOne({ identifier });

    const accessToken = generateAccessToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    const refreshToken = generateRefreshToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

export const logout = async (req: Request, res: Response): Promise<void> => {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? ("none" as const) : ("lax" as const),
  };
  res.clearCookie("access_token", cookieOptions);
  res.clearCookie("refresh_token", cookieOptions);
  res.json({ message: "Logout successful" });
};

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

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refresh_token;
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

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
