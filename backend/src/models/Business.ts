/**
 * @file Business.ts
 * @description Mongoose schema for business members.
 * @architecture Unique index on email; sparse unique index on username; tracks approval status.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  company: string;
  role: string;
  stage: string;
  email: string;
  phone: string;
  username?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description Mongoose schema definition for Business entities
 */
const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    stage: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

/**
 * @module Business
 */
export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
