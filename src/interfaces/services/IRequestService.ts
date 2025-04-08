import { ObjectId } from "mongoose";
import { ReturnDataRequest } from "../../repositories/RequestRepository";
import { IQuery } from "../models/IQuery";
import { IRequest } from "../models/IRequest";

export interface IRequestService {
  createRequest: (
    childIds: [string] | [ObjectId],
    doctorId: string | ObjectId,
    title: string,
    requesterId: string
  ) => Promise<IRequest>;

  getRequest: (id: string | ObjectId, requesterId: string) => Promise<IRequest>;

  getRequestsByUserId: (
    userId: string | ObjectId,
    requesterId: string,
    query: IQuery,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ) => Promise<ReturnDataRequest>;

  getAllRequests: (
    query: IQuery,
    status?: string
  ) => Promise<ReturnDataRequest>;

  updateRequestStatus: (
    id: string | ObjectId,
    requesterId: string,
    status: string
  ) => Promise<IRequest>;

  deleteRequest: (id: string, requesterId: string) => Promise<IRequest>;
}
