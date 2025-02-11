import mongoose from "mongoose";
import HealthDataModel from "../models/HealthDataModel";
import { IHealthData } from "../interfaces/IHealthData";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";

export type HealthData = {
  healthData: IHealthData[];
  page: number;
  total: number;
  totalPages: number;
};

class HealthDataRepository {
  /**
   * Create a new healthData entry.
   * @param healthData - Object containing healthData details adhering to IHealthData.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The created healthData document.
   * @throws CustomException when the creation fails.
   */
  async createHealthData(
    healthData: Partial<IHealthData>,
    session?: mongoose.ClientSession
  ): Promise<IHealthData> {
    try {
      const result = await HealthDataModel.create([healthData], { session });
      return result[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create health data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve a single healthData by ID.
   * @param healthDataId - The ID of the healthData to retrieve.
   * @returns The healthData document or null if not found.
   * @throws CustomException when retrieval fails.
   */
  async getHealthDataById(
    healthDataId: string,
    isDeleted: boolean
  ): Promise<IHealthData | null> {
    try {
      const healthData = await HealthDataModel.findOne({ _id: healthDataId, isDeleted });
      return healthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve health data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve healthData by member ID.
   * @param memberId - The member ID to filter healthData by.
   * @returns A list of healthData documents.
   * @throws CustomException when retrieval fails.
   */
  async getHealthDataByChildId(
    childId: string,
    query: IQuery,
    isDeleted: boolean
  ): Promise<HealthData> {
    try {
      type SearchQuery = {
        isDeleted: boolean;
        childId: mongoose.Types.ObjectId;
        name?: { $regex: string; $options: string };
      };
      const { page, size, search, order, sortBy } = query;
      const searchQuery: SearchQuery = {
        isDeleted,
        childId: new mongoose.Types.ObjectId(childId),
      };

      if (search) {
        searchQuery.name = { $regex: search, $options: "i" };
      }
      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const healthData = await HealthDataModel.aggregate([
        { $match: searchQuery },
        {
          $skip: skip,
        },
        {
          $limit: size,
        },
        {
          $project: {
            childId: 1,
            inputDate: 1,
            height: 1,
            weight: 1,
            headCircumference: 1,
            armCircumference: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { [sortField]: sortOrder } },
      ]);

      const totalHealthData = await HealthDataModel.countDocuments(searchQuery);

      return {
        healthData,
        page,
        total: totalHealthData,
        totalPages: Math.ceil(totalHealthData / size),
      };
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve health data by user ID: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Update a healthData by ID.
   * @param healthDataId - The ID of the healthData to update.
   * @param updateData - Partial object of healthData data to update.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The updated healthData document or null if not found.
   * @throws CustomException when update fails.
   */
  async updateHealthData(
    healthDataId: string,
    updateData: Partial<IHealthData>,
    session?: mongoose.ClientSession
  ): Promise<IHealthData | null> {
    try {
      const updatedHealthData = await HealthDataModel.findByIdAndUpdate(
        healthDataId,
        { $set: updateData },
        { new: true, session, runValidators: true }
      ).exec();
      return updatedHealthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to update health data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Soft delete a healthData by setting isDeleted to true.
   * @param healthDataId - The ID of the healthData to delete.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The deleted healthData document or null if not found.
   * @throws CustomException when delete fails.
   */
  async deleteHealthData(
    healthDataId: string,
    session?: mongoose.ClientSession
  ): Promise<IHealthData | null> {
    try {
      const deletedHealthData = await HealthDataModel.findOneAndDelete({ _id: healthDataId }, { session }).exec();
      return deletedHealthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to delete health data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default HealthDataRepository;
