import mongoose from "mongoose";
import { IReceipt } from "../IReceipt";
import { IQuery } from "../IQuery";

export interface IReceiptRepository {
  createReceipt(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IReceipt>;

  getAllReceipt(
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<object>;

  getReceiptsByUserId(
    query: IQuery,
    userId: mongoose.Types.ObjectId | string,
    ignoreDeleted: boolean
  ): Promise<object>;

  getReceiptById(
    id: mongoose.Types.ObjectId | string,
    ignoreDeleted: boolean,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null>;

  deleteReceiptById(
    id: mongoose.Types.ObjectId | string,
    requesterId: mongoose.Types.ObjectId | string,
    session?: mongoose.ClientSession
  ): Promise<IReceipt | null>;
}
