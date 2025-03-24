import mongoose, { ObjectId } from "mongoose";
import { IReceipt } from "../IReceipt";
import { ReturnDataReceipts } from "../../repositories/ReceiptRepository";
import { IQuery } from "../IQuery";

export interface IReceiptService {
  createReceipt: (
    userId: string,
    transactionId: string,
    MembershipPackageId: string | ObjectId,
    totalAmount: object,
    paymentMethod: string,
    paymentGateway: string,
    type: string
  ) => Promise<IReceipt>;

  getAllReceipts: (
    query: IQuery,
    requesterId: string
  ) => Promise<ReturnDataReceipts>;

  getReceiptsByUserId: (
    query: IQuery,
    userId: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ) => Promise<ReturnDataReceipts>;

  getReceiptById: (
    id: string | mongoose.Types.ObjectId,
    requesterId: string | mongoose.Types.ObjectId
  ) => Promise<IReceipt | null>;

  deleteReceipt: (
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string
  ) => Promise<IReceipt | null>;
}
