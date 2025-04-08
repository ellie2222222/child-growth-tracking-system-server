import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IGrowthData } from "../interfaces/models/IGrowthData";
import { IGrowthResult } from "../interfaces/models/IGrowthResult";
import { BmiLevelEnum, LevelEnum } from "../enums/LevelEnum";

const growthResultSchema = new Schema<IGrowthResult>(
  {
    weight: {
      percentile: { type: Number },
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    height: {
      percentile: { type: Number },
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    bmi: {
      percentile: { type: Number },
      description: { type: String },
      level: { type: String, enum: BmiLevelEnum },
    },
    headCircumference: {
      percentile: { type: Number },
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    armCircumference: {
      percentile: { type: Number },
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    description: { type: String },
    level: { type: String, enum: LevelEnum },
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
    bmi: {
      type: Number
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
