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
    password: { type: String },
    photoUrl: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const CommunityMember = mongoose.model<ICommunityMember>(
  "CommunityMember",
  CommunityMemberSchema,
);
