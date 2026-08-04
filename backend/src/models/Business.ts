import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  company: string;
  role: string;
  stage: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    stage: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
