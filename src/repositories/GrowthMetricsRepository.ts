import mongoose, { UpdateWriteOpResult } from "mongoose";
import { IBmi } from "../interfaces/IBmi";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import BmiModel from "../models/BmiModel";
import WfaModel from "../models/WfaModel";
import Lhfa from "../models/LhfaModel";
import { GenderEnumType } from "../enums/GenderEnum";
import { ILhfa } from "../interfaces/ILhfa";
import { IWfa } from "../interfaces/IWfa";

export type GrowthMetricsQuery = {
  ageMonth: number;
  ageMonthRange: string;
  gender: GenderEnumType;
  percentiles: Array<{ percentile: number; value: number }>;
};

class GrowthMetricsRepository {
  async insertBmiData(
    bmiDataArray: Partial<IBmi>[],
    session?: mongoose.ClientSession
  ): Promise<IBmi[]> {
    try {
      return await BmiModel.insertMany(bmiDataArray, { session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to insert BMI data: ${(error as Error).message}`
      );
    }
  }

  async getBmiData(query: Partial<GrowthMetricsQuery>): Promise<IBmi[]> {
    try {
      return await BmiModel.find(query);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get BMI data: ${(error as Error).message}`
      );
    }
  }

  async updateBmiData(
    bmiData: Partial<IBmi>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await BmiModel.updateMany(
        { gender: bmiData.gender, ageMonth: bmiData.ageMonth, ageMonthRange: bmiData.ageMonthRange }, 
        { $set: bmiData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update BMI data: ${(error as Error).message}`
      );
    }
  }

  async insertWfaData(
    wfaDataArray: Partial<IWfa>[],
    session?: mongoose.ClientSession
  ): Promise<IWfa[]> {
    try {
      return await WfaModel.insertMany(wfaDataArray, { session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to insert WFA data: ${(error as Error).message}`
      );
    }
  }

  async getWfaData(query: Partial<GrowthMetricsQuery>): Promise<IWfa[]> {
    try {
      return await WfaModel.find(query);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get WFA data: ${(error as Error).message}`
      );
    }
  }

  async updateWfaData(
    wfaData: Partial<IWfa>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await WfaModel.updateMany(
        { gender: wfaData.gender, ageMonth: wfaData.ageMonth, ageMonthRange: wfaData.ageMonthRange }, 
        { $set: wfaData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update WFA data: ${(error as Error).message}`
      );
    }
  }

  async insertLhfaData(
    lhfaDataArray: Partial<ILhfa>[],
    session?: mongoose.ClientSession
  ): Promise<ILhfa[]> {
    try {
      return await Lhfa.insertMany(lhfaDataArray, { session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to insert LHFA data: ${(error as Error).message}`
      );
    }
  }

  async getLhfaData(query: Partial<GrowthMetricsQuery>): Promise<ILhfa[]> {
    try {
      return await Lhfa.find(query);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get LHFA data: ${(error as Error).message}`
      );
    }
  }

  async updateLhfaData(
    lhfaData: Partial<ILhfa>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await Lhfa.updateMany(
        { gender: lhfaData.gender, ageMonth: lhfaData.ageMonth, ageMonthRange: lhfaData.ageMonthRange }, 
        { $set: lhfaData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update LHFA data: ${(error as Error).message}`
      );
    }
  }
}

export default GrowthMetricsRepository;
