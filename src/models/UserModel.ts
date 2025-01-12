import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IUser } from "../interfaces/IUser";

const userModelSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      default: "",
    },
    role: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      default: null,
      unique: true, 
      index: true, 
    },
    ipAddress: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      default: null,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationToken: {
      type: String,
      default: "",
    },
    resetPasswordPin: {
      value: { type: String },
      expiresAt: { type: Date },
      isVerified: { type: Boolean, default: false },
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

userModelSchema.index({ email: 1 }); 
userModelSchema.index({ googleId: 1 }); 
userModelSchema.index({ phoneNumber: 1 }); 

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userModelSchema);

export default UserModel;
