import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IGrowthData } from "../interfaces/IGrowthData";

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
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

const GrowthDataModel: Model<IGrowthData> = mongoose.model<IGrowthData>(
  "GrowthData",
  growthDataSchema
);

export default GrowthDataModel;
