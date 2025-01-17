import mongoose from "mongoose";
import ReceiptModel from "../models/ReceiptModel";
import { IReceipt } from "../interfaces/IReceipt";
import CustomException from "../exceptions/CustomException";
import UserModel from "../models/UserModel";
import UserEnum from "../enums/UserEnum";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
class ReceiptRepository {
  private database = new Database();
  async createReceipt(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IReceipt> {
    // console.log(data);
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
  async getAllReceipt(session?: mongoose.ClientSession): Promise<IReceipt[]> {
    try {
      const receipts = await ReceiptModel.find({}, {}, { session });
      if (receipts.length === 0) {
        throw new CustomException(404, "No receipts found");
      }
      return receipts;
    } catch (error: unknown) {
      if (error as Error) {
        throw error;
      } else if (error as CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
  //admin/super-admin => get all
  //else get isDeleted: false
  async getReceiptsByUserId(
    userId: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt[]> {
    try {
      const requester = await UserModel.findOne({
        _id: requesterId,
        isDeleted: false,
      });
      if (!requester) {
        throw new CustomException(404, "Requester not found");
      }
      if (requesterId.toString() !== userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can view other people's receipts"
        );
      }
      const query =
        requester &&
        (requester.role === UserEnum.ADMIN ||
          requester.role === UserEnum.SUPER_ADMIN)
          ? { userId: this.database.ensureObjectId(userId) }
          : { userId: this.database.ensureObjectId(userId), isDeleted: false };

      const receipts = await ReceiptModel.find(query, {}, { session });
      if (receipts.length === 0) {
        throw new CustomException(404, "No receipts found");
      }
      return receipts;
    } catch (error: unknown) {
      if (error as Error) {
        throw error;
      } else if (error as CustomException) {
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
    requesterId: mongoose.Types.ObjectId | string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null> {
    try {
      const requester = await UserModel.findOne({
        _id: requesterId,
        isDeleted: false,
      });

      const query =
        requester &&
        (requester.role === UserEnum.ADMIN ||
          requester.role === UserEnum.SUPER_ADMIN)
          ? { _id: this.database.ensureObjectId(id) }
          : { _id: this.database.ensureObjectId(id), isDeleted: false };
      const receipt = await ReceiptModel.findOne(query, null, { session });
      if (!receipt) {
        throw new CustomException(404, "Receipt not found");
      }
      return receipt;
    } catch (error) {
      if (error as Error) {
        throw error;
      } else if (error as CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async deleteRecepitById(
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null> {
    try {
      const checkReceipt = await ReceiptModel.findOne(
        { _id: this.database.ensureObjectId(id), isDeleted: false },
        null,
        { session }
      );
      if (!checkReceipt) {
        throw new CustomException(404, "Receipt not found");
      }
      if (requesterId !== checkReceipt?.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can delete other people's receipt"
        );
      }
      const receipt = await ReceiptModel.findOneAndUpdate(
        { _id: this.database.ensureObjectId(id), isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
      );
      return receipt;
    } catch (error) {
      if (error as Error) {
        throw error;
      } else if (error as CustomException) {
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
