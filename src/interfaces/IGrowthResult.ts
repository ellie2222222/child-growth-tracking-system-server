import { Document } from "mongoose";
import { BmiLevelEnumType, LevelEnumType } from "../enums/LevelEnum";

export interface IGrowthResult extends Document {
  weight: {
    percentile: number,
    description: string;
    level: LevelEnumType;
  };
  height: {
    percentile: number,
    description: string;
    level: LevelEnumType;
  };
  bmi: {
    percentile: number,
    description: string;
    level: BmiLevelEnumType;
  };
  headCircumference: {
    percentile: number,
    description: string;
    level: LevelEnumType;
  };
  armCircumference: {
    percentile: number,
    description: string;
    level: LevelEnumType;
  };
  weightForLength: {
    percentile: number,
    description: string;
    level: LevelEnumType;
  };
  description: string;
  level: LevelEnumType;
}
