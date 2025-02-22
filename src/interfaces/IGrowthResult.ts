import { Document } from "mongoose";
import { BmiLevelEnumType, LevelEnumType } from "../enums/LevelEnum";

export interface IGrowthResult extends Document {
  weight: {
    description: string;
    level: LevelEnumType;
  };
  height: {
    description: string;
    level: LevelEnumType;
  };
  bmi: {
    description: string;
    level: BmiLevelEnumType;
  };
  headCircumference: {
    description: string;
    level: LevelEnumType;
  };
  armCircumference: {
    description: string;
    level: LevelEnumType;
  };
  description: string;
  level: LevelEnumType;
}
