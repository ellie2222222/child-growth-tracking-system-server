import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: number;
  avatar: string;
  googleId: string;
  appleUser: boolean;
  ipAddress: string;
  email: string;
  phoneNumber: string;
  password: string;
  lastLogin: Date;
  isActive: boolean;
  isVerified: boolean;
  verifyToken: string;
  resetPasswordPin: {
    value: string | null;
    expiresAt: Date | null;
    isVerified: boolean;
  };
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
