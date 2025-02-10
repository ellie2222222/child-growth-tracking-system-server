import mongoose, { UpdateWriteOpResult } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import BfaModel from "../models/BfaModel";
import WfaModel from "../models/WfaModel";
import LhfaModel from "../models/LhfaModel";
import WflhModel from "../models/WflhModel";
import { GenderEnumType } from "../enums/GenderEnum";
import { ILhfa } from "../interfaces/ILhfa";
import { IWfa } from "../interfaces/IWfa";
import { IBfa } from "../interfaces/IBfa";
import { IWflh } from "../interfaces/IWflh";
import HcfaModel from "../models/HcfaModel";
import { IHcfa } from "../interfaces/IHcfa";
import AcfaModel from "../models/AcfaModel";
import { IAcfa } from "../interfaces/IAcfa";

export type GrowthMetricsQuery = {
  age: number;
  gender: GenderEnumType;
  percentiles: Array<{ percentile: number; value: number }>;
};

class GrowthMetricsRepository {
  async insertBfaData(
    bfaDataArray: Partial<IBfa>[],
    session?: mongoose.ClientSession
  ): Promise<IBfa[]> {
    try {
      return await BfaModel.insertMany(bfaDataArray, { session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to insert BFA data: ${(error as Error).message}`
      );
    }
  }

  async getBfaData(query: Partial<GrowthMetricsQuery>): Promise<IBfa[]> {
    try {
      return await BfaModel.find(query);
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to get BFA data: ${(error as Error).message}`
      );
    }
  }

  async updateBfaData(
    bfaData: Partial<IBfa>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await BfaModel.updateMany(
        { gender: bfaData.gender, age: bfaData.age }, 
        { $set: bfaData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update BFA data: ${(error as Error).message}`
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
        { gender: wfaData.gender, age: wfaData.age }, 
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
      return await LhfaModel.insertMany(lhfaDataArray, { session });
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to insert LHFA data: ${(error as Error).message}`
      );
    }
  }

  async getLhfaData(query: Partial<GrowthMetricsQuery>): Promise<ILhfa[]> {
    try {
      return await LhfaModel.find(query);
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
      return await LhfaModel.updateMany(
        { gender: lhfaData.gender, age: lhfaData.age }, 
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

  async updateWflhData(
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

  async updateHcfaData(
    hcfaData: Partial<IHcfa>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await HcfaModel.updateMany(
        { gender: hcfaData.gender, age: hcfaData.age }, 
        { $set: hcfaData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update HCFA data: ${(error as Error).message}`
      );
    }
  }

  async updateAcfaData(
    acfaData: Partial<IAcfa>,
    session?: mongoose.ClientSession
  ): Promise<UpdateWriteOpResult> {
    try {
      return await AcfaModel.updateMany(
        { gender: acfaData.gender, age: acfaData.age }, 
        { $set: acfaData },
        { upsert: true, session }
      );
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to update ACFA data: ${(error as Error).message}`
      );
    }
  }
}

export default GrowthMetricsRepository;
