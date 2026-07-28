import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
  identifier: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  identifier: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  lockedUntil: { type: Date },
});

export const LoginAttempt = mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);