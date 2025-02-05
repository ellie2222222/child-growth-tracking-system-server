import { Document } from "mongoose";
import { GenderEnumType } from "../enums/GenderEnum";

export interface IWfa extends Document {
  ageMonth: number;
  ageMonthRange: string;
  gender: GenderEnumType;
  percentiles: Array<{ 
    percentile: number;
    value: number;
  }>;
  L: number,
  M: number,
  S: number,
  isDeleted?: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}
