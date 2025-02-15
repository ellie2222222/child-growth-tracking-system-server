import { Document } from "mongoose";
import { GenderEnumType } from "../enums/GenderEnum";
import { GrowthMetricsEnumType } from "../enums/GrowthMetricsEnum";

export interface IGrowthMetricForAge extends Document {
  age: { 
    inMonths: number
    inDays: number
  },
  gender: GenderEnumType;
  type: GrowthMetricsEnumType;
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
