import mongoose, { ObjectId } from "mongoose";
import { IQuery } from "../IQuery";
import { IRequest } from "../IRequest";
import { ReturnDataRequest } from "../../repositories/RequestRepository";

export interface IRequestRepository {
  createRequest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IRequest>;
  getRequest(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IRequest | null>;
  getAllRequests(
    query: IQuery,
    ignoreDeleted: boolean,
    status?: string
  ): Promise<ReturnDataRequest>;
  getRequestsByUserId(
    userId: string,
    query: IQuery,
    ignoreDeleted: boolean,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ): Promise<ReturnDataRequest>;
  updateRequest(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IRequest>;
  deleteRequest(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IRequest>;
  validateRequestDailyLimit(userId: string): Promise<void>;
  getOldRequest(): Promise<mongoose.Types.ObjectId[]>;
  handleOldRequest(requestIds: mongoose.Types.ObjectId[]): Promise<void>;
}
