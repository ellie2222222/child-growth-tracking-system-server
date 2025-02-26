import mongoose, { Schema } from "mongoose";
import { ITier } from "../interfaces/ITier";

const TierSchema = new Schema<ITier>(
  {
    tier: {
      type: Number,
      required: true,
      enum: [0, 1, 2],
    },
    childrenLimit: {
      type: Number,
      required: true,
    },
    postsLimit: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },
      time: {
        type: Number,
        required: true,
        default: 30,
      },
      description: {
        type: String,
        default: "N/A",
      },
    },
    updateRecordsLimit: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },
      time: {
        type: Number,
        required: true,
        default: 30,
      },
      description: {
        type: String,
        default: "N/A",
      },
    },
    viewRecordsLimit: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },
      time: {
        type: Number,
        required: true,
        default: 30,
      },
      description: {
        type: String,
        default: "N/A",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TierModel = mongoose.model<ITier>("Tier", TierSchema);
export default TierModel;
