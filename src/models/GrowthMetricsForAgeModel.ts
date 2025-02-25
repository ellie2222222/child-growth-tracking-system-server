import mongoose, { Model, Schema } from "mongoose";
import GenderEnum from "../enums/GenderEnum";
import baseModelSchema from "./BaseModel";
import { IGrowthMetricForAge } from "../interfaces/IGrowthMetricForAge";
import { GrowthMetricsForAgeEnum } from "../enums/GrowthMetricsEnum";

const growthMetricForAgeModelSchema = new Schema<IGrowthMetricForAge>(
  {
    age: { 
      inMonths: { type: Number, required: true, },
      inDays: { type: Number, required: true, }
    },
    gender: {
      type: Number,
      enum: Object.keys(GenderEnum),
      required: true,
    },
    type: {
        type: String,
        enum: Object.keys(GrowthMetricsForAgeEnum)
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

const GrowthMetricForAgeModel: Model<IGrowthMetricForAge> = mongoose.model<IGrowthMetricForAge>("GrowthMetricForAge", growthMetricForAgeModelSchema);

export default GrowthMetricForAgeModel;