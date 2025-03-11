import mongoose from "mongoose";
import ReceiptModel from "../models/ReceiptModel";
import { IReceipt } from "../interfaces/IReceipt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";

export type ReturnDataReceipts = {
  receipts: IReceipt[];
  page: number;
  totalReceipts: number;
  totalPages: number;
};

class ReceiptRepository implements IReceiptRepository {
  async createReceipt(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IReceipt> {
    try {
      const receipt = await ReceiptModel.create([data], { session });
      return receipt[0];
    } catch (error: unknown) {
      if (error as Error) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  //admin/super-admin only
  getAllReceipt = async (
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<ReturnDataReceipts> => {
    try {
      const { page, size, order, sortBy } = query;
      type searchQuery = {
        isDeleted?: boolean;
      };

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;
      const skip = (page - 1) * size;

      const searchQuery = ignoreDeleted ? {} : { isDeleted: true };

      const receipts = await ReceiptModel.aggregate([
        { $match: searchQuery },
        { $skip: skip },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);

      if (receipts.length === 0) {
        throw new CustomException(404, "No receipts found");
      }

      const countReceipts = await ReceiptModel.countDocuments(searchQuery);

      return {
        receipts: receipts,
        page,
        totalReceipts: countReceipts,
        totalPages: Math.ceil(countReceipts / size),
      };
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  //admin/super-admin => get all
  //else get isDeleted: false
  async getReceiptsByUserId(
    query: IQuery,
    userId: mongoose.Types.ObjectId | string,
    ignoreDeleted: boolean
  ): Promise<ReturnDataReceipts> {
    try {
      const { page, size, order, sortBy } = query;
      type searchQuery = {
        userId: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };

      const searchQuery: searchQuery = ignoreDeleted
        ? { userId: new mongoose.Types.ObjectId(userId) }
        : {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          };

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;
      const skip = (page - 1) * size;
      const receipts = await ReceiptModel.aggregate([
        {
          $match: searchQuery,
        },
        { $skip: skip },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);
      if (receipts.length === 0) {
        throw new CustomException(404, "No receipts found");
      }

      const countReceipts = await ReceiptModel.countDocuments(searchQuery);

      return {
        receipts: receipts,
        page,
        totalReceipts: countReceipts,
        totalPages: Math.ceil(countReceipts / size),
      };
    } catch (error: unknown) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  //admin can get all
  //user can get not deleted
  async getReceiptById(
    id: mongoose.Types.ObjectId | string,
    ignoreDeleted: boolean,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null> {
    try {
      const query = ignoreDeleted
        ? { _id: new mongoose.Types.ObjectId(id) }
        : { _id: new mongoose.Types.ObjectId(id), isDeleted: false };

      const receipt = await ReceiptModel.findOne(query, null, { session });

      if (!receipt) {
        throw new CustomException(404, "Receipt not found");
      }

      return receipt;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async deleteReceiptById(
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null> {
    try {
      const checkReceipt = await ReceiptModel.findOne(
        { _id: new mongoose.Types.ObjectId(id as string), isDeleted: false },
        null,
        { session }
      );
      if (!checkReceipt) {
        throw new CustomException(404, "Receipt not found");
      }
      if (requesterId !== checkReceipt?.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Cannot delete receipt"
        );
      }
      const receipt = await ReceiptModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id as string), isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
      );
      return receipt;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getAllReceiptsTimeInterval(
    startDate: Date,
    endDate: Date
  ): Promise<IReceipt[]> {
    try {
      const receipts = await ReceiptModel.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).lean();
      return receipts || [];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}
export default ReceiptRepository;
