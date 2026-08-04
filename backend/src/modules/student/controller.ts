import { Request, Response } from "express";
import { Student } from "../../models/Student";
import { generateOTP, isOTPExpired } from "../../utils/otp";
import { sendOTPEmail, sendWelcomeEmail } from "../../utils/email";

export const apply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, college, course, email } = req.body;

    if (!name || !college || !course || !email) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const student = await Student.create({
      name,
      college,
      course,
      email: normalizedEmail,
      status: "pending",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      studentId: student._id.toString(),
    });
  } catch (error) {
    console.error("Student application error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (student.isEmailVerified) {
      res.status(400).json({ message: "Email already verified" });
      return;
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    student.otp = otp;
    student.otpExpiry = otpExpiry;
    await student.save();

    await sendOTPEmail(student.email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (!student.otp || !student.otpExpiry) {
      res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });
      return;
    }

    if (isOTPExpired(student.otpExpiry)) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    if (student.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    student.isEmailVerified = true;
    student.otp = undefined;
    student.otpExpiry = undefined;
    await student.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitIdCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, idCardLink } = req.body;

    if (!email || !idCardLink) {
      res.status(400).json({ message: "Email and ID card link are required" });
      return;
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (!student.isEmailVerified) {
      res.status(400).json({ message: "Please verify your email first" });
      return;
    }

    student.idCardLink = idCardLink;
    await student.save();

    // Send welcome email
    await sendWelcomeEmail(student.email, student.name);

    res.json({ message: "Application completed successfully" });
  } catch (error) {
    console.error("Submit ID card error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
