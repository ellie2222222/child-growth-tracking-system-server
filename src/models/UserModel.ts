import mongoose, { Schema, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IUser } from "../interfaces/models/IUser";

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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordPin: {
      value: { type: String, default: null },
      expiresAt: { type: Date, default: null },
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
      futurePlan: {
        type: Schema.Types.ObjectId,
        ref: "MembershipPackage",
        default: null,
      },
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

// Unique except default value
userModelSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $exists: true, $ne: null } },
  }
);
userModelSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: "" } },
  }
);
userModelSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { phoneNumber: { $exists: true, $ne: null } },
  }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userModelSchema);

export default UserModel;
