import { Document, Types } from "mongoose";

export interface IHealthData extends Document {
  childId: Types.ObjectId;
  inputDate: Date;
  weight: number;
  height: number;
  headCircumference: number;
  armCircumference: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
