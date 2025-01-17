import mongoose from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IReceipt } from "../interfaces/IReceipt";
import ReceiptRepository from "../repositories/ReceiptRepository";
import Database from "../utils/database";

class ReceiptService {
  private database: Database;
  private receiptRepository: ReceiptRepository;
  constructor() {
    this.receiptRepository = new ReceiptRepository();
    this.database = new Database();
  }
  createReceipt = async (
    userId: string,
    transactionId: string,
    totalAmount: object,
    paymentMethod: string,
    paymentGateway: string,
    type: string
  ): Promise<IReceipt> => {
    try {
      const session = await this.database.startTransaction();
      const data = {
        userId,
        transactionId,
        totalAmount,
        paymentMethod,
        paymentGateway,
        type,
      };
      const receipt = await this.receiptRepository.createReceipt(data, session);
      return receipt;
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
  };
  getAllReceipts = async (): Promise<IReceipt[]> => {
    try {
      const session = await this.database.startTransaction();
      const receipts = await this.receiptRepository.getAllReceipt(session);
      return receipts;
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
  };
  getReceiptsByUserId = async (
    userId: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ): Promise<IReceipt[]> => {
    try {
      const session = await this.database.startTransaction();
      const receipts = await this.receiptRepository.getReceiptsByUserId(
        userId,
        requesterId,
        session
      );
      return receipts;
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
  };
  getReceiptById = async (
    id: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ) => {
    try {
      const session = await this.database.startTransaction();
      const receipt = await this.receiptRepository.getReceiptById(
        id,
        requesterId,
        session
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
  };
  deleteReceipt = async (
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string
  ) => {
    try {
      const session = await this.database.startTransaction();
      const receipt = await this.receiptRepository.deleteRecepitById(
        id,
        requesterId,
        session
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
  };
}

export default ReceiptService;
