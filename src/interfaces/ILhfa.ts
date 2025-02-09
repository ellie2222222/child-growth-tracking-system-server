import { Document } from "mongoose";
import { GenderEnumType } from "../enums/GenderEnum";

export interface ILhfa extends Document {
  age: { 
    inMonths: number
    inDays: number
  },
  gender: GenderEnumType;
  percentiles: {
    L: number;
    M: number;
    S: number;
    values: Array<{ 
      percentile: number;
      value: number;
    }>;
  };
  isDeleted?: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}
