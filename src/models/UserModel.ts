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
    },
    email: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    password: {
      type: String,
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
    verificationPin: {
      value: { type: String },
      expiresAt: { type: Date },
    },
    resetPasswordPin: {
      value: { type: String },
      expiresAt: { type: Date },
      isVerified: { type: Boolean, default: false },
    },
    subscription: {
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      currentPlan: {
        type: Schema.Types.ObjectId,
        ref: "MembershipPackage",
        default: null,
      },
      tier: {
        type: Number,
        default: 0,
      },
      futureMembership: {
        type: Schema.Types.ObjectId,
        ref: "MembershipPackage",
        default: null,
      },
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

// Unique except default value
userModelSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $exists: true } } }
);
userModelSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);
userModelSchema.index(
  { phoneNumber: 1 },
  { unique: true, partialFilterExpression: { phoneNumber: { $exists: true } } }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userModelSchema);

export default UserModel;
