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
 * @desc    Submit a new business application and send a welcome email
 * @route   POST /api/business/apply
 * @access  Public
 */
export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, company, role, stage, email, phone } = req.body;

    if (!name || !company || !role || !stage || !email || !phone) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const existingBusiness = await Business.findOne({ email: normalizedEmail });
    if (existingBusiness) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

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

    // Send welcome email (just says pending review, no creds yet)
    await sendWelcomeEmail(business.email, business.name);

    res.status(201).json({
      message: "Application submitted successfully",
      businessId: business._id.toString(),
    });
  } catch (error) {
    console.error("Business application error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc    Approve a pending business application, generate credentials, create a community member profile, and send approval email
 * @route   POST /api/business/admin/approve/:id
 * @access  Private (Admin)
 */
export const adminApprove = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ message: "Business application not found" });
      return;
    }

    if (business.status === "approved") {
      res.status(400).json({ message: "Business is already approved" });
      return;
    }

    // Generate unique username based on name or company
    const baseUsername = (business.name || business.company)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    let generatedUsername = baseUsername;
    let usernameExists = true;
    let suffix = 1;

    while (usernameExists) {
      const existingUser = await Business.findOne({
        username: generatedUsername,
      });
      if (!existingUser) {
        usernameExists = false;
      } else {
        // Generate 3 random digits
        const randomNum = Math.floor(100 + Math.random() * 900);
        generatedUsername = `${baseUsername}${randomNum}`;
        suffix++;
        // Safety break
        if (suffix > 20) break;
      }
    }

    // Generate password based on phone number + random 4 chars
    const randomChars = Math.random().toString(36).slice(-4);
    const generatedPassword = `${business.phone}@${randomChars}`;

    business.status = "approved";
    business.username = generatedUsername;
    business.password = generatedPassword;
    business.requiresPasswordChange = true;
    await business.save();

    // Hash password for CommunityMember
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create CommunityMember
    await CommunityMember.create({
      name: business.name,
      username: generatedUsername,
      email: business.email,
      phone: business.phone,
      role: `${business.role} at ${business.company}`,
      password: hashedPassword,
      status: "active",
    });

    // Send approval email with login credentials
    await sendApprovalEmail(business.email, business.name, "business", {
      username: generatedUsername,
      password: generatedPassword,
    });

    res.status(200).json({
      message: "Business approved successfully and login credentials sent",
      businessId: business._id.toString(),
      username: generatedUsername,
    });
  } catch (error) {
    console.error("Admin approval error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
