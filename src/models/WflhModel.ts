import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IWflh } from "../interfaces/IWflh";
import baseModelSchema from "./BaseModel";

const wflhModelSchema = new Schema<IWflh>(
  {
    height: { 
      type: Number,
      required: true,
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

const WflhModel: Model<IWflh> = mongoose.model<IWflh>("WFLH", wflhModelSchema);

export default WflhModel;
