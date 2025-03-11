import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { ITier } from "../interfaces/ITier";
import TierModel from "../models/TierModel";
import { IQuery } from "../interfaces/IQuery";
import { ITierRepository } from "../interfaces/repositories/ITierRepository";

export type ReturnDataTiers = {
  tiers: ITier[];
  page: number;
  totalPage: number;
  total: number;
};
class TierRepository implements ITierRepository {
  async createTier(
    data: Partial<ITier>,
    session?: mongoose.ClientSession
  ): Promise<ITier> {
    try {
      const checkTier = await TierModel.findOne({
        isDeleted: false,
        tier: data.tier,
      });

      if (checkTier) {
        await TierModel.updateOne(
          { isDeleted: false, tier: data.tier },
          { $set: { isDeleted: true } }
        );
      }

      const tier = await TierModel.create([data], { session });

      return tier[0];
    } catch (error) {
      if (error as Error | CustomException) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Error creating tier: ${(error as Error | CustomException).message}`
        );
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async updateTier(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITier> {
    try {
      const tier = await TierModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(id as string) },
        data,
        {
          session,
          new: true,
        }
      );

      if (!tier) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Tier not found"
        );
      }

      return tier;
    } catch (error) {
      if (error as Error | CustomException) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Error creating tier: ${(error as Error | CustomException).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getTier(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<ITier | null> {
    try {
      type searchQuery = {
        _id: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };

      const query: searchQuery = {
        _id: new mongoose.Types.ObjectId(id as string),
      };

      if (!ignoreDeleted) {
        query.isDeleted = false;
      }

      const tier = await TierModel.findOne(query);

      if (!tier) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Tier not found"
        );
      }

      return tier;
    } catch (error) {
      if (error as Error | CustomException) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Error creating tier: ${(error as Error | CustomException).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getTiers(
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<ReturnDataTiers> {
    try {
      const { page, size, search, order, sortBy } = query;
      type searchQuery = {
        isDeleted?: boolean;
        tier?: number;
      };

      const searchQuery: searchQuery = ignoreDeleted
        ? {}
        : { isDeleted: false };

      if (search) {
        searchQuery.tier = parseInt(search);
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const tiers = await TierModel.aggregate([
        { $match: searchQuery },
        { $skip: (page - 1) * size },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);

      if (tiers.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No tiers found"
        );
      }

      const tierCount = await TierModel.countDocuments(searchQuery);
      return {
        tiers,
        page,
        totalPage: Math.ceil(tierCount / size),
        total: tierCount,
      };
    } catch (error) {
      if (error as Error | CustomException) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Error creating tier: ${(error as Error | CustomException).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getCurrentTierData(tier: number): Promise<ITier> {
    try {
      const tierData = await TierModel.findOne({
        tier: tier,
        isDeleted: false,
      });

      if (!tierData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Tier not found"
        );
      }

      return tierData;
    } catch (error) {
      if (error as Error | CustomException) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Error creating tier: ${(error as Error | CustomException).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default TierRepository;
