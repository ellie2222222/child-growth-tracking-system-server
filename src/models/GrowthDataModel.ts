import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IGrowthData } from "../interfaces/IGrowthData";
import { IGrowthResult } from "../interfaces/IGrowthResult";

const growthResultSchema = new Schema<IGrowthResult>(
  {
    weight: {
      description: { type: String },
      level: { type: String },
    },
    height: {
      description: { type: String },
      level: { type: String },
    },
    headCircumference: {
      description: { type: String },
      level: { type: String },
    },
    armCircumference: {
      description: { type: String },
      level: { type: String },
    },
    description: { type: String },
    level: { type: String },
  },
  { _id: false }
);

const growthDataSchema = new Schema<IGrowthData>(
  {
    childId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Children",
    },
    inputDate: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    headCircumference: {
      type: Number,
    },
    armCircumference: {
      type: Number,
    },
    growthResult: growthResultSchema,
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

const GrowthDataModel: Model<IGrowthData> = mongoose.model<IGrowthData>(
  "GrowthData",
  growthDataSchema
);

export default GrowthDataModel;
