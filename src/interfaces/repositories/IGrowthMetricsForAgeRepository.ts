import mongoose, { UpdateWriteOpResult } from "mongoose";
import { IGrowthMetricForAge } from "../models/IGrowthMetricForAge";
import { GrowthMetricsEnumType } from "../../enums/GrowthMetricsEnum";
import { IGrowthVelocity } from "../models/IGrowthVelocity";
import { GenderEnumType } from "../../enums/GenderEnum";
import { IWflh } from "../models/IWflh";

export interface IGrowthMetricsRepository {
  upsertGrowthMetricsForAgeData(
    data: Partial<IGrowthMetricForAge>,
    type: GrowthMetricsEnumType,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult>;

  getGrowthMetricsForAgeData(
    gender: GenderEnumType,
    age: number,
    unit: string
  ): Promise<IGrowthMetricForAge[]>;

  upsertGrowthVelocityData(
    data: Partial<IGrowthVelocity>,
    type: string,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult>;

  getGrowthVelocityData(gender: GenderEnumType): Promise<IGrowthVelocity[]>;

  upsertWflhData(
    wflhData: Partial<IWflh>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult>;

  getWflhData(gender: GenderEnumType, height: number): Promise<IWflh[]>;
}
