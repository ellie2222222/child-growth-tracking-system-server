import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: number;
  avatar: string;
  googleId: string;
  email: string;
  phoneNumber: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  verificationPin: {
    value: string | null;
    expiresAt: Date | null;
  };
  resetPasswordPin: {
    value: string | null;
    expiresAt: Date | null;
    isVerified: boolean;
  };
  subscription: {
    startDate: Date | null;
    endDate: Date | null;
    currentPlan: Types.ObjectId | null;
    tier: number | null;
    futurePlan: Types.ObjectId | null;
  };
  childrenIds: [Types.ObjectId];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
