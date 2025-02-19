import { Document, Schema, Types } from "mongoose";

export interface IGrowthData extends Document {
  childId: Types.ObjectId;
  inputDate: Date;
  weight: number;
  height: number;
  headCircumference: number;
  armCircumference: number;
  growthResult: Schema,
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
