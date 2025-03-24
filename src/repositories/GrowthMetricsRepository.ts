import mongoose, { UpdateWriteOpResult } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import WflhModel from "../models/WflhModel";
import { GenderEnumType } from "../enums/GenderEnum";
import { IWflh } from "../interfaces/IWflh";
import { GrowthMetricsEnumType } from "../enums/GrowthMetricsEnum";
import { IGrowthMetricForAge } from "../interfaces/IGrowthMetricForAge";
import GrowthMetricForAgeModel from "../models/GrowthMetricsForAgeModel";
import { IGrowthVelocity } from "../interfaces/IGrowthVelocity";
import GrowthVelocityModel from "../models/GrowthVelocityModel";
import { IGrowthMetricsRepository } from "../interfaces/repositories/IGrowthMetricsForAgeRepository";

export type GrowthMetricsQuery = {
  age: number;
  gender: GenderEnumType;
  percentiles: Array<{ percentile: number; value: number }>;
};

class GrowthMetricsRepository implements IGrowthMetricsRepository {
  async upsertGrowthMetricsForAgeData(
    data: Partial<IGrowthMetricForAge>,
    type: GrowthMetricsEnumType,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await GrowthMetricForAgeModel.updateMany(
        { gender: data.gender, age: data.age, type }, 
        { $set: data },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update growth metrics for age data: ${(error as Error).message}`
      );
    }
  }

  async getGrowthMetricsForAgeData(gender: number, age: number, unit: string): Promise<IGrowthMetricForAge[]> {
    try {
      let data: IGrowthMetricForAge[] = [];
      switch (unit) {
        case "month":
          data = await GrowthMetricForAgeModel.find(
            { 
              gender: gender,
              'age.inMonths': age,
            },
          );
          break;

        case "day":
          data = await GrowthMetricForAgeModel.find(
            { 
              gender: gender,
              'age.inDays': age,
            },
          );
          break;
      }
      return data;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get data: ${(error as Error).message}`
      );
    }
  }

  async upsertGrowthVelocityData(
    data: Partial<IGrowthVelocity>,
    type: string,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await GrowthVelocityModel.updateMany(
        { 
          gender: data.gender, 
          type,
          'firstInterval.inMonths': data.firstInterval?.inMonths,
          'lastInterval.inMonths': data.firstInterval?.inMonths,
        }, 
        { $set: data },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update WFLH data: ${(error as Error).message}`
      );
    }
  }
  
  async getGrowthVelocityData(gender: number): Promise<IGrowthVelocity[]> {
    try {
      const data: IGrowthVelocity[] = await GrowthVelocityModel.find({ gender });
      return data;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get data: ${(error as Error).message}`
      );
    }
  }

  async upsertWflhData(
    wflhData: Partial<IWflh>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await WflhModel.updateMany(
        { gender: wflhData.gender, height: wflhData.height }, 
        { $set: wflhData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update WFLH data: ${(error as Error).message}`
      );
    }
  }

  async getWflhData(gender: number, height: number): Promise<IWflh[]> {
    try {
      const data: IWflh[] = await WflhModel.find({ gender, height });

      return data;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get data: ${(error as Error).message}`
      );
    }
  }
}

export default GrowthMetricsRepository;
