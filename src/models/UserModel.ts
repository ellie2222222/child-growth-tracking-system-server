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
      // unique: true,
      // index: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      // unique: true,
      // index: true,
    },
    phoneNumber: {
      type: String,
      default: null,
      // unique: true,
      // index: true,
    },
    password: {
      type: String,
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
      value: { type: String },
      expiresAt: { type: Date },
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

//unque except default value
userModelSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $ne: null } } }
);
userModelSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $ne: "" } } }
);
userModelSchema.index(
  { phoneNumber: 1 },
  { unique: true, partialFilterExpression: { phoneNumber: { $ne: null } } }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userModelSchema);

export default UserModel;
