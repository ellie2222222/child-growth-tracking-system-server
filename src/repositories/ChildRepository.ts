import mongoose, { Schema } from "mongoose";
import ChildModel from "../models/ChildModel";
import { IChild } from "../interfaces/IChild";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";

export type ChildrenData = {
  children: IChild[];
  page: number;
  total: number;
  totalPages: number;
};

class ChildRepository {
  /**
   * Create a new child entry.
   * @param childData - Object containing child details adhering to IChild.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The created child document.
   * @throws CustomException when the creation fails.
   */
  async createChild(
    childData: Partial<IChild>,
    session?: mongoose.ClientSession
  ): Promise<IChild> {
    try {
      console.log(childData);
      const result = await ChildModel.create([childData], { session });
      return result[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create child: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve a single child by ID.
   * @param childId - The ID of the child to retrieve.
   * @returns The child document or null if not found.
   * @throws CustomException when retrieval fails.
   */
  async getChildById(
    childId: string,
    isDeleted: boolean
  ): Promise<IChild | null> {
    try {
      const child = await ChildModel.findOne({ _id: childId, isDeleted });
      return child;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve child: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Retrieve children by member ID.
   * @param memberId - The member ID to filter children by.
   * @returns A list of child documents.
   * @throws CustomException when retrieval fails.
   */
  async getChildrenByUserId(
    memberId: string,
    query: IQuery,
    isDeleted: boolean
  ): Promise<ChildrenData> {
    try {
      type SearchQuery = {
        isDeleted: boolean;
        relationships?: { $elemMatch: { memberId: mongoose.Types.ObjectId } };
        name?: { $regex: string; $options: string };
      };
      const { page, size, search, order, sortBy } = query;
      const searchQuery: SearchQuery = {
        isDeleted,
        relationships: {
          $elemMatch: { memberId: new mongoose.Types.ObjectId(memberId) },
        },
      };

      if (search) {
        searchQuery.name = { $regex: search, $options: "i" };
      }
      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const children = await ChildModel.aggregate([
        { $match: searchQuery },
        {
          $skip: skip,
        },
        {
          $limit: size,
        },
        {
          $project: {
            memberId: 1,
            name: 1,
            gender: 1,
            birthDate: 1,
            note: 1,
            relationships: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { [sortField]: sortOrder } },
      ]);

      const totalChildren = await ChildModel.countDocuments(searchQuery);

      return {
        children,
        page,
        total: totalChildren,
        totalPages: Math.ceil(totalChildren / size),
      };
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve children by user ID: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Update a child by ID.
   * @param childId - The ID of the child to update.
   * @param updateData - Partial object of child data to update.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The updated child document or null if not found.
   * @throws CustomException when update fails.
   */
  async updateChild(
    childId: string,
    updateData: Partial<IChild>,
    session?: mongoose.ClientSession
  ): Promise<IChild | null> {
    try {
      console.log(updateData)
      const updatedChild = await ChildModel.findByIdAndUpdate(
        childId,
        { $set: updateData },
        { new: true, session, runValidators: true }
      ).exec();
      return updatedChild;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to update child: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Soft delete a child by setting isDeleted to true.
   * @param childId - The ID of the child to delete.
   * @param session - Optional Mongoose client session for transactions.
   * @returns The deleted child document or null if not found.
   * @throws CustomException when delete fails.
   */
  async deleteChild(
    childId: string,
    session?: mongoose.ClientSession
  ): Promise<IChild | null> {
    try {
      const deletedChild = await ChildModel.findByIdAndUpdate(
        childId,
        { $set: { isDeleted: true } },
        { new: true, session }
      ).exec();
      return deletedChild;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to delete child: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async countUserChildren(userId: string) {
    try {
      const count = await ChildModel.countDocuments({
        relationships: {
          $elemMatch: { memberId: new mongoose.Types.ObjectId(userId) },
        },
      });

      return count;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to delete child: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default ChildRepository;
