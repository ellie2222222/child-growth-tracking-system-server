import mongoose, { Schema } from "mongoose";
import { IMembershipPackage } from "../interfaces/models/IMembershipPackage";

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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    postLimit: {
      type: Number,
      default: 0,
    },
    updateChildDataLimit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, strict: true }
);

const MembershipModel = mongoose.model<IMembershipPackage>(
  "MembershipPackage",
  MembershipPackageSchema
);

export default MembershipModel;
