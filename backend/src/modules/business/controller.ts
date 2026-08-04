import { Request, Response } from "express";
import { Business } from "../../models/Business";
import { sendWelcomeEmail } from "../../utils/email";

export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, company, role, stage, email } = req.body;

    if (!name || !company || !role || !stage || !email) {
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
      status: "pending",
    });

    // Send welcome email
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
