import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: number;
  avatar: string;
  googleId: string;
  email: string;
  phoneNumber: string;
  password: string;
  lastLogin: Date;
  isActive: boolean;
  isVerified: boolean;
  verificationToken: {
    value: string | null;
    expiresAt: Date | null;
  };
  resetPasswordPin: {
    value: string | null;
    expiresAt: Date | null;
    isVerified: boolean;
  };
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
