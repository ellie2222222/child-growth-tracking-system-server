import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IGrowthData } from "../interfaces/IGrowthData";
import { IGrowthResult } from "../interfaces/IGrowthResult";
import { BmiLevelEnum, LevelEnum } from "../enums/LevelEnum";

const growthResultSchema = new Schema<IGrowthResult>(
  {
    weight: {
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    height: {
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    bmi: {
      description: { type: String },
      level: { type: String, enum: BmiLevelEnum },
    },
    headCircumference: {
      description: { type: String },
      level: { type: String, enum: LevelEnum },
    },
    armCircumference: {
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
