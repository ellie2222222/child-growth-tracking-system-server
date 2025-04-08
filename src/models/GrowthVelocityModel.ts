import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import { IGrowthVelocity } from "../interfaces/models/IGrowthVelocity";
import baseModelSchema from "./BaseModel";
import { GrowthVelocityEnum } from "../enums/GrowthMetricsEnum";

const growthVelocityModelSchema = new Schema<IGrowthVelocity>(
  {
    firstInterval: { 
      inMonths: { type: Number, required: true, },
      inWeeks: { type: Number, required: true, },
      inDays: { type: Number, required: true, }
    },
    lastInterval: { 
      inMonths: { type: Number, required: true, },
      inWeeks: { type: Number, required: true, },
      inDays: { type: Number, required: true, }
    },
    gender: {
      type: Number,
      enum: [GenderEnum.BOY, GenderEnum.GIRL],
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(GrowthVelocityEnum),
    },
    percentiles: {
      L: { type: Number, required: true },
      M: { type: Number, required: true },
      S: { type: Number, required: true },
      delta: { type: Number, required: true },
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

const GrowthVelocityModel: Model<IGrowthVelocity> = mongoose.model<IGrowthVelocity>("GrowthVelocity", growthVelocityModelSchema);

export default GrowthVelocityModel;
