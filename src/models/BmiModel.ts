import mongoose, { Model, Schema } from "mongoose";
import { IBmi } from "../interfaces/IBmi";
import GenderEnum from "../enums/GenderEnum";

const bmiModelSchema = new Schema<IBmi>(
  {
    ageMonth: { type: Number, required: true },
    ageMonthRange: { type: String, required: true },
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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BmiModel: Model<IBmi> = mongoose.model<IBmi>("BMI", bmiModelSchema);

export default BmiModel;