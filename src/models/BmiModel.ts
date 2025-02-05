import mongoose, { Model, Schema } from "mongoose";
import { IBmi } from "../interfaces/IBmi";
import GenderEnum from "../enums/GenderEnum";

const bmiModelSchema = new Schema<IBmi>(
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

const BmiModel: Model<IBmi> = mongoose.model<IBmi>("BMI", bmiModelSchema);

export default BmiModel;
