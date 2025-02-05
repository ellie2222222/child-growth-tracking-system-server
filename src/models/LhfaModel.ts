import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { ILhfa } from "../interfaces/ILhfa";

const lhfaModelSchema = new Schema<ILhfa>(
  {
    ageMonth: { type: Number },
    ageMonthRange: { type: String },
    gender: {
      type: Number,
      enum: [GenderEnum.BOY, GenderEnum.GIRL],
      required: true,
    },
    percentiles: {
      L: { type: Number, required: true },
      M: { type: Number, required: true },
      S: { type: Number, required: true },
      values: [
        {
          percentile: { type: Number, required: true },
          value: { type: Number, required: true },
          _id: false,
        },
      ],
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
  },
  { timestamps: true }
);

const LhfaModel: Model<ILhfa> = mongoose.model<ILhfa>("LHFA", lhfaModelSchema);

export default LhfaModel;
