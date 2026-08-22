/**
 * @file Student.ts
 * @description Mongoose schema for student registrations.
 * @architecture Unique index on email; tracks OTP for email verification and approval status.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  college: string;
  course: string;
  email: string;
  otp?: string;
  otpExpiry?: Date;
  isEmailVerified: boolean;
  idCardLink?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description Mongoose schema definition for Student applications
 */
const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    college: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    idCardLink: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

/**
 * @module Student
 */
export const Student = mongoose.model<IStudent>("Student", StudentSchema);
