import nodemailer from "nodemailer";
import { config } from "../config/env";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  if (!config.smtpUser || !config.smtpPass) {
    console.log("⚠️ SMTP not configured. Email would be sent to:", options.to);
    console.log("Subject:", options.subject);
    return;
  }

  const mailOptions = {
    from: config.senderEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", options.to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #000;">Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  await sendMail({ to, subject: "Verify Your Email - Business Orbit", html });
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #000;">Welcome to Business Orbit, ${name}!</h1>
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for applying to join our community. Your application has been received and is under review.
      </p>
      <div style="background: #f9f9f9; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <p>Our team will review your application and notify you via email once approved. This typically takes 1-2 business days.</p>
      </div>
      <div style="background: #000; color: #fff; padding: 20px; margin: 30px 0; text-align: center;">
        <h3 style="margin-top: 0;">Launching April 2024</h3>
        <p style="margin-bottom: 0;">Get ready for exclusive networking opportunities, events, and programs.</p>
      </div>
      <p style="color: #666; font-size: 14px;">Best regards,<br/>The Business Orbit Team</p>
    </div>
  `;
  await sendMail({ to, subject: "Welcome to Business Orbit Community! 🎉", html });
};

export const sendBulkEmail = async (recipients: string[], subject: string, content: string): Promise<void> => {
  await sendMail({ to: recipients, subject, html: content });
};

export const sendApprovalEmail = async (to: string, name: string, userType: "student" | "business", loginDetails?: { username?: string; password?: string }): Promise<void> => {
  const loginSection = loginDetails?.username && loginDetails?.password ? `
      <div style="background: #f9f9f9; border-left: 4px solid #000; padding: 20px; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #000;">Your Login Credentials</h3>
        <p style="margin-bottom: 5px;"><strong>Username:</strong> ${loginDetails.username}</p>
        <p style="margin-bottom: 5px;"><strong>Password:</strong> ${loginDetails.password}</p>
        <p style="font-size: 14px; color: #666; margin-top: 15px;"><em>Please log in and change your password immediately.</em></p>
      </div>
  ` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #000;">🎉 Welcome to Business Orbit, ${name}!</h1>
      <p style="font-size: 16px; line-height: 1.6;">
        Great news! Your application has been approved. You are now part of the most action-oriented community.
      </p>
      <div style="background: #000; color: #fff; padding: 30px; margin: 30px 0; text-align: center;">
        <h2 style="margin: 0 0 10px 0;">You're In! ✅</h2>
        <p style="margin: 0;">Start connecting with ${userType === "student" ? "opportunities and events" : "founders and business leaders"}</p>
      </div>
      ${loginSection}
      <p style="font-size: 16px; line-height: 1.6;">
        Watch your inbox for updates about upcoming events, networking opportunities, and exclusive programs.
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Best regards,<br/>The Business Orbit Team</p>
    </div>
  `;
  await sendMail({ to, subject: "Congratulations! Your Application Has Been Approved", html });
};
