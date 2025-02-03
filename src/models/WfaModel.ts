import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IWfa } from "../interfaces/IWfa";

const wfaModelSchema = new Schema<IWfa>(
  {
    ageMonth: { type: Number },
    ageMonthRange: { type: String },
    gender: {
      type: Number,
      enum: [GenderEnum.BOY, GenderEnum.GIRL],
      required: true,
    },
    L: {
      type: Number,
      required: true,
    },
    M: {
      type: Number,
      required: true,
    },
    S: {
      type: Number,
      required: true,
    },
    percentiles: [
      {
        percentile: {
          type: Number,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
      },
    ],
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: true }
);

const WfaModel: Model<IWfa> = mongoose.model<IWfa>("WFA", wfaModelSchema);

export default WfaModel;
