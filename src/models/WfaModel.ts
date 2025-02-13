import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IWfa } from "../interfaces/IWfa";
import baseModelSchema from "./BaseModel";

const wfaModelSchema = new Schema<IWfa>(
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

const WfaModel: Model<IWfa> = mongoose.model<IWfa>("WFA", wfaModelSchema);

export default WfaModel;
