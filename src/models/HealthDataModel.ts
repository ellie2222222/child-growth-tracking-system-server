import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IHealthData } from "../interfaces/IHealthData";

const healthDataSchema = new Schema<IHealthData>(
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

const HealthDataModel: Model<IHealthData> = mongoose.model<IHealthData>(
  "HealthData",
  healthDataSchema
);

export default HealthDataModel;
