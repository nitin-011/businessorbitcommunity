/**
 * @file controller.ts
 * @description Business module controllers for handling new applications and admin approvals.
 * @architecture Handles business onboarding requests and integrates with the CommunityMember model and email utilities for approvals.
 */
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Business } from "../../models/Business";
import { CommunityMember } from "../../models/CommunityMember";
import { sendWelcomeEmail, sendApprovalEmail } from "../../utils/email";

/**
 * @desc    Submit a new business application. Handles validation, sanitization, and sends a welcome notification.
 * @route   POST /api/business/apply
 * @access  Public
 */
export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, company, role, stage, email, phone } = req.body;

    // 1. Structural Validation: Ensure all mandatory fields are present before processing
    if (!name || !company || !role || !stage || !email || !phone) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // 2. Type Checking: Prevent injection or runtime errors by enforcing string types for email
    if (typeof email !== "string") {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }
    
    // Normalize email to lowercase to ensure consistency across the database and prevent duplicate registrations
    const normalizedEmail = email.toLowerCase();

    // 3. Duplicate Prevention: Check if this email is already registered in the system
    const existingBusiness = await Business.findOne({ email: normalizedEmail });
    if (existingBusiness) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // 4. Persistence: Create a new pending application in the database.
    // Applications start in a 'pending' state and must be manually approved by an admin.
    const business = await Business.create({
      name,
      company,
      role,
      stage,
      email: normalizedEmail,
      phone,
      status: "pending",
      requiresPasswordChange: true,
    });

    // 5. Notification: Send an automated welcome email confirming receipt of the application.
    // Note: This email only acknowledges receipt; credentials are sent separately upon admin approval.
    await sendWelcomeEmail(business.email, business.name);

    // 6. Response: Return a 201 Created status with the new application's ID
    res.status(201).json({
      message: "Application submitted successfully",
      businessId: business._id.toString(),
    });
  } catch (error) {
    console.error("Business application error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
