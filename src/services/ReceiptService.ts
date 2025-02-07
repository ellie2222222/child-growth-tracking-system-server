import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IReceipt } from "../interfaces/IReceipt";
import ReceiptRepository from "../repositories/ReceiptRepository";
import Database from "../utils/database";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import UserEnum from "../enums/UserEnum";
import UserRepository from "../repositories/UserRepository";

class ReceiptService {
  private database: Database;
  private receiptRepository: ReceiptRepository;
  private membershipPackageRepository: MembershipPackageRepository;
  private userRepository: UserRepository;

  constructor() {
    this.receiptRepository = new ReceiptRepository();
    this.database = Database.getInstance();
    this.membershipPackageRepository = new MembershipPackageRepository();
    this.userRepository = new UserRepository();
  }

  createReceipt = async (
    userId: string,
    transactionId: string,
    MembershipPackageId: string | ObjectId,
    totalAmount: object,
    paymentMethod: string,
    paymentGateway: string,
    type: string
  ): Promise<IReceipt> => {
    const session = await this.database.startTransaction();
    try {
      const mempack =
        await this.membershipPackageRepository.getMembershipPackage(
          MembershipPackageId,
          true
        );
      if (!mempack) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership Package Not Found"
        );
      }
      const product = {
        name: mempack.name,
        description: mempack.description,
        id: mempack._id,
      };
      const data = {
        userId,
        transactionId,
        totalAmount,
        product,
        paymentMethod,
        paymentGateway,
        type,
      };
      const receipt = await this.receiptRepository.createReceipt(data, session);
      await session.commitTransaction();
      return receipt;
    } catch (error: unknown) {
      await session.abortTransaction();
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  getAllReceipts = async (requesterId: string): Promise<IReceipt[]> => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }
      const receipts = await this.receiptRepository.getAllReceipt(
        ignoreDeleted
      );
      return receipts;
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

  getReceiptsByUserId = async (
    userId: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ): Promise<IReceipt[]> => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }
      const receipts = await this.receiptRepository.getReceiptsByUserId(
        userId,
        requesterId,
        ignoreDeleted
      );
      return receipts;
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

  getReceiptById = async (
    id: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }

      const receipt = await this.receiptRepository.getReceiptById(
        id,
        requesterId,
        ignoreDeleted
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
  };

  deleteReceipt = async (
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string
  ) => {
    const session = await this.database.startTransaction();
    try {
      const receipt = await this.receiptRepository.deleteRecepitById(
        id,
        requesterId,
        session
      );
      await session.commitTransaction();
      return receipt;
    } catch (error) {
      await session.abortTransaction();
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };
}

export default ReceiptService;
