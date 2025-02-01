import mongoose, { Schema } from "mongoose";
import { IMembershipPackage } from "../interfaces/IMembershipPackage";

const MembershipPackageSchema = new Schema<IMembershipPackage>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    price: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        enum: ["USD", "VND"],
      },
    },
    duration: {
      value: { type: Number, require: true },
      unit: { type: String, required: true, enum: ["DAY"] },
    },
    tier: {
      type: Number,
      required: true,
      default: 0,
      enum: [0, 1, 2],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MembershipModel = mongoose.model<IMembershipPackage>(
  "MembershipPackage",
  MembershipPackageSchema
);

export default MembershipModel;
