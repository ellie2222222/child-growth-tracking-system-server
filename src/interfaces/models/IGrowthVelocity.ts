import { Document } from "mongoose";
import { GenderEnumType } from "../../enums/GenderEnum";
import { GrowthMetricsEnumType } from "../../enums/GrowthMetricsEnum";

export interface IGrowthVelocity extends Document {
  firstInterval: { 
    inMonths: number;
    inWeeks: number;
    inDays: number;
  },
  lastInterval: { 
    inMonths: number;
    inWeeks: number;
    inDays: number;
  },
  gender: GenderEnumType;
  type: GrowthMetricsEnumType;
  percentiles: {
    L: number;
    M: number;
    S: number;
    delta: number;
    values: Array<{ 
      percentile: number;
      value: number;
    }>;
  };
  isDeleted?: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}
