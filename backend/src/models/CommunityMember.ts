/**
 * @file CommunityMember.ts
 * @description Mongoose schema for general community members.
 * @architecture Unique index on email; sparse unique index on username; tracks active/inactive status.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface ICommunityMember extends Document {
  name: string;
  username?: string;
  role?: string;
  bio?: string;
  linkedin?: string;
  instagram?: string;
  phone?: string;
  email: string;
  password?: string;
  photoUrl?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description Mongoose schema definition for Community Members
 */
const CommunityMemberSchema = new Schema<ICommunityMember>(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    role: { type: String },
    bio: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    photoUrl: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

/**
 * @module CommunityMember
 */
export const CommunityMember = mongoose.model<ICommunityMember>(
  "CommunityMember",
  CommunityMemberSchema,
);
