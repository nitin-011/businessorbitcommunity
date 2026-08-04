import mongoose, { Schema, Document } from "mongoose";

export interface IOrbitCardOrder extends Document {
  memberId?: mongoose.Types.ObjectId;
  shippingAddress: string;
  fullName: string;
  companyAndDesignation: string;
  email: string;
  phone: string;
  amount: number;
  transactionId: string; // Internal unique ID sent to PhonePe
  providerReferenceId?: string; // PhonePe transaction ID
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

const OrbitCardOrderSchema = new Schema<IOrbitCardOrder>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "CommunityMember" },
    shippingAddress: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyAndDesignation: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    providerReferenceId: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const OrbitCardOrder = mongoose.model<IOrbitCardOrder>(
  "OrbitCardOrder",
  OrbitCardOrderSchema,
);
