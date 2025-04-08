import { Document, Types } from "mongoose";
import { IGrowthResult } from "./IGrowthResult";
import { IGrowthVelocityResult } from "./IGrowthVelocityResult";

export interface IGrowthData extends Document {
  childId: Types.ObjectId;
  inputDate: Date;
  weight: number;
  height: number;
  headCircumference: number;
  armCircumference: number;
  growthResult: IGrowthResult | Partial<IGrowthResult>;
  bmi?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  growthVelocityResult?: Partial<IGrowthVelocityResult>[];
}
