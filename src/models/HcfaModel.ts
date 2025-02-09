import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IHcfa } from "../interfaces/IHcfa";
import baseModelSchema from "./BaseModel";

const hcfaModelSchema = new Schema<IHcfa>(
  {
    age: { 
      inMonths: { type: Number, required: true, },
      inDays: { type: Number, required: true, }
    },
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
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

const HcfaModel: Model<IHcfa> = mongoose.model<IHcfa>("HCFA", hcfaModelSchema);

export default HcfaModel;