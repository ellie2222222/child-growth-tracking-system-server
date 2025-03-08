import mongoose from "mongoose";
import GrowthDataModel from "../models/GrowthDataModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";
import { IGrowthData } from "../interfaces/IGrowthData";
import ChildModel from "../models/ChildModel";
import { IGrowthDataRepository } from "../interfaces/repositories/IGrowthDataRepository";

export type GrowthData = {
  growthData: IGrowthData[];
  page: number;
  total: number;
  totalPages: number;
};

class GrowthDataRepository implements IGrowthDataRepository {
  /**
   * Create a new growthData entry.
   * @param growthData - Object containing growthData details adhering to IGrowthData.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The created growthData document.
   * @throws CustomException when the creation fails.
   */
  async createGrowthData(
    growthData: Partial<IGrowthData>,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData> {
    try {
      const result = await GrowthDataModel.create([growthData], { session });
      return result[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create growth data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve a single growthData by ID.
   * @param growthDataId - The ID of the growthData to retrieve.
   * @returns The growthData document or null if not found.
   * @throws CustomException when retrieval fails.
   */
  async getGrowthDataById(
    growthDataId: string,
    isDeleted: boolean
  ): Promise<IGrowthData | null> {
    try {
      const growthData = await GrowthDataModel.findOne({
        _id: growthDataId,
        isDeleted,
      });
      return growthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve growth data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve growthData by member ID.
   * @param memberId - The member ID to filter growthData by.
   * @returns A list of growthData documents.
   * @throws CustomException when retrieval fails.
   */
  async getGrowthDataByChildId(
    childId: string,
    query: IQuery,
    isDeleted: boolean
  ): Promise<GrowthData> {
    try {
      type SearchQuery = {
        isDeleted: boolean;
        childId: mongoose.Types.ObjectId;
      };
      const { page, size, order, sortBy } = query;
      const searchQuery: SearchQuery = {
        isDeleted,
        childId: new mongoose.Types.ObjectId(childId),
      };

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const growthData = await GrowthDataModel.aggregate([
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

      const totalGrowthData = await GrowthDataModel.countDocuments(searchQuery);

      return {
        growthData,
        page,
        total: totalGrowthData,
        totalPages: Math.ceil(totalGrowthData / size),
      };
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve growth data by user ID: ${
            (error as Error).message
          }`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getAllGrowthDataByChildId(childId: string): Promise<IGrowthData[]> {
    try {
      const growthData = await GrowthDataModel.find({
        childId: new mongoose.Types.ObjectId(childId),
        isDeleted: false,
      });

      return growthData;
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Update a growthData by ID.
   * @param growthDataId - The ID of the growthData to update.
   * @param updateData - Partial object of growthData data to update.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The updated growthData document or null if not found.
   * @throws CustomException when update fails.
   */
  async updateGrowthData(
    growthDataId: string,
    updateData: Partial<IGrowthData>,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData | null> {
    try {
      const updatedGrowthData = await GrowthDataModel.findByIdAndUpdate(
        growthDataId,
        { $set: updateData },
        { new: true, session, runValidators: true }
      ).exec();
      return updatedGrowthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to update growth data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Soft delete a growthData by setting isDeleted to true.
   * @param growthDataId - The ID of the growthData to delete.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The deleted growthData document or null if not found.
   * @throws CustomException when delete fails.
   */
  async deleteGrowthData(
    growthDataId: string,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData | null> {
    try {
      const deletedGrowthData = await GrowthDataModel.findOneAndDelete(
        { _id: growthDataId },
        { session }
      ).exec();
      return deletedGrowthData;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to delete growth data: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async countUserUpdateGrowthData(userId: string, start: Date, end: Date) {
    try {
      const children = await ChildModel.find({
        "relationships.memberId": new mongoose.Types.ObjectId(userId),
      }).select("_id");

      if (!children.length) return 0;

      const childIds = children.map((child) => child._id);

      const count = await GrowthDataModel.countDocuments({
        childId: { $in: childIds },
        inputDate: { $gte: start, $lte: end },
      });

      return count;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to count user's times of updating growth data: ${
            (error as Error).message
          }`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default GrowthDataRepository;
