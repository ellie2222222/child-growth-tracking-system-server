import { Document } from "mongoose";

export interface IGrowthVelocityResult extends Document {
  period: string;
  startDate: Date;
  endDate: Date;
  height: {
    percentile: number,
    heightVelocity: number | null; // cm/month
    description: string;
  }
  weight: {
    percentile: number,
    weightVelocity: number | null; // cm/month
    description: string;
  }
  headCircumference: {
    percentile: number,
    headCircumferenceVelocity: number | null; // cm/month
    description: string;
  }
}
