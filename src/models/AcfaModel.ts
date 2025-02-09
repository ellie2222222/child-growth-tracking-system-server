import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IAcfa } from "../interfaces/IAcfa";
import baseModelSchema from "./BaseModel";

const acfaModelSchema = new Schema<IAcfa>(
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

const AcfaModel: Model<IAcfa> = mongoose.model<IAcfa>("ACFA", acfaModelSchema);

export default AcfaModel;