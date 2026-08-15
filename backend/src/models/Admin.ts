/**
 * @file Admin.ts
 * @description Mongoose schema for system administrators.
 * @architecture Unique index on email; no foreign relations.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

/**
 * @module Admin
 */
export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
