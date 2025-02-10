import mongoose, { Schema } from "mongoose";
import { ITier } from "../interfaces/ITier";

const TierSchema = new Schema<ITier>(
  {
    tier: {
      type: "Number",
      required: true,
      enums: [0, 1, 2],
    },
    childrenLimit: {
      type: Number,
      required: true,
    },
    postsLimit: {
      type: Number,
      required: true,
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
