import { Document } from "mongoose";

export interface IGrowthResult extends Document {
  weight?: {
    description: string;
    level: string;
  };
  height?: {
    description: string;
    level: string;
  };
  headCircumference?: {
    description: string;
    level: string;
  };
  armCircumference?: {
    description: string;
    level: string;
  };
  description?: string;
  level?: string;
}
