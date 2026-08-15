/**
 * @file auth.ts
 * @description Authentication and authorization middleware.
 * @architecture Verifies JWT tokens, extracts user roles, fetches entity details from Admin or CommunityMember collections, and manages role-based access control.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Admin } from "../models/Admin";
import { CommunityMember } from "../models/CommunityMember";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  // Backward compatibility during refactor, will be populated if applicable
  admin?: {
    id: string;
    email: string;
    role: string;
  };
  member?: {
    id: string;
    email: string;
  };
}

/**
 * @desc    Factory function that creates an authentication middleware to verify JWT tokens and enforce role-based access.
 * @param   {string[]} [roles] - Optional array of allowed roles. If provided, the user must have one of these roles.
 * @returns {Function} Express middleware function.
 */
export const authenticate = (roles?: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    try {
      let user;
      const accountType =
        decoded.accountType ||
        (decoded.role === "community" ? "community" : "admin");

      if (accountType === "admin") {
        user = await Admin.findById(decoded.id);
      } else if (accountType === "community") {
        user = await CommunityMember.findById(decoded.id);
      }

      if (!user) {
        res.status(401).json({ message: "User not found or revoked" });
        return;
      }

      if (decoded.role === "community" && (user as any).status !== "active") {
        res.status(403).json({ message: "Account is inactive" });
        return;
      }

      if (roles && !roles.includes(decoded.role)) {
        res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
        return;
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: decoded.role,
      };

      if (decoded.role === "admin") {
        req.admin = req.user;
      } else if (decoded.role === "community") {
        req.member = req.user;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @desc    Middleware that attempts to authenticate the user via JWT but allows the request to proceed even if unauthenticated. Populates req.user if valid.
 * @param   {AuthRequest} req - Express request object.
 * @param   {Response} res - Express response object.
 * @param   {NextFunction} next - Express next middleware function.
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token =
    req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    next();
    return;
  }

  let decoded: any;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    next();
    return;
  }

  try {
    let user;
    const accountType =
      decoded.accountType ||
      (decoded.role === "community" ? "community" : "admin");

    if (accountType === "admin") {
      user = await Admin.findById(decoded.id);
    } else if (accountType === "community") {
      user = await CommunityMember.findById(decoded.id);
    }

    if (
      user &&
      (decoded.role !== "community" || (user as any).status === "active")
    ) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: decoded.role,
      };

      if (decoded.role === "admin") {
        req.admin = req.user;
      } else if (decoded.role === "community") {
        req.member = req.user;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Aliases for backward compatibility in routes
/**
 * @desc    Middleware enforcing admin authentication.
 */
export const authMiddleware = authenticate(["admin"]);

/**
 * @desc    Middleware enforcing community member authentication.
 */
export const requireCommunityAuth = authenticate(["community"]);

/**
 * @desc    Middleware for optional community member authentication.
 */
export const optionalCommunityAuth = optionalAuthenticate;
