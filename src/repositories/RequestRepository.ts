import mongoose, { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import RequestModel from "../models/RequestModel";
import { IQuery } from "../interfaces/IQuery";
import dotenv from "dotenv";
import { IRequest, RequestStatus } from "../interfaces/IRequest";
import { IRequestRepository } from "../interfaces/repositories/IRequestRepository";
import ConfigModel from "../models/ConfigModel";
import { IConfig } from "../interfaces/IConfig";
dotenv.config();

export type ReturnDataRequest = {
  requests: IRequest[];
  page: number;
  total: number;
  totalPages: number;
};
class RequestRepository implements IRequestRepository {
  async createRequest(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IRequest> {
    try {
      const request = await RequestModel.create([data], { session });
      return request[0];
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getRequest(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IRequest | null> {
    try {
      const searchQuery = ignoreDeleted
        ? { _id: new mongoose.Types.ObjectId(id as string) }
        : {
            _id: new mongoose.Types.ObjectId(id as string),
            isDeleted: false,
          };

      const request = await RequestModel.aggregate([
        { $match: searchQuery },
        {
          $lookup: {
            from: "users",
            localField: "memberId",
            foreignField: "_id",
            as: "member",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$member" },
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$doctor" },
        {
          $lookup: {
            from: "children",
            localField: "childIds",
            foreignField: "_id",
            as: "children",
          },
        },
      ]);

      if (!request[0]) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Request not found"
        );
      }

      return request[0];
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getAllRequests(
    query: IQuery,
    ignoreDeleted: boolean,
    status?: string
  ): Promise<ReturnDataRequest> {
    type SearchQuery = {
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: { $regex: string; $options: string };
    };
    try {
      const { page, size, search, order, sortBy } = query;
      const searchQuery: SearchQuery = {};

      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      if (search) {
        searchQuery.title = { $regex: search, $options: "i" };
      }

      if (status) {
        searchQuery.status = { $regex: status, $options: "i" };
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const requests = await RequestModel.aggregate([
        {
          $match: searchQuery,
        },
        { $sort: { [sortField]: sortOrder } },

        { $skip: skip },
        { $limit: size },
        {
          $lookup: {
            from: "users",
            localField: "memberId",
            foreignField: "_id",
            as: "member",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$member" },
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$doctor" },
        {
          $lookup: {
            from: "children",
            localField: "childIds",
            foreignField: "_id",
            as: "children",
          },
        },
      ]);

      const total = await RequestModel.countDocuments(searchQuery);
      return { requests, page, total, totalPages: Math.ceil(total / size) };
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getRequestsByUserId(
    userId: string,
    query: IQuery,
    ignoreDeleted: boolean,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ): Promise<ReturnDataRequest> {
    type SearchQuery = {
      memberId?: mongoose.Types.ObjectId;
      doctorId?: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: { $regex?: string; $options?: string; $ne?: string };
    };

    try {
      const { page, size, search, order, sortBy } = query;
      const searchQuery: SearchQuery = {};

      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      if (search) {
        searchQuery.title = { $regex: search, $options: "i" };
      }

      if (status) {
        searchQuery.status = { $regex: status, $options: "i" };
      }

      if (as === "DOCTOR") {
        searchQuery.doctorId = new mongoose.Types.ObjectId(userId);
        if (status) {
          searchQuery.status = {
            $regex: status,
            $options: "i",
            $ne: RequestStatus.Pending,
          };
        } else {
          searchQuery.status = { $ne: RequestStatus.Pending };
        }
      } else {
        searchQuery.memberId = new mongoose.Types.ObjectId(userId);
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const requests = await RequestModel.aggregate([
        {
          $match: searchQuery,
        },
        { $sort: { [sortField]: sortOrder } },

        { $skip: skip },
        { $limit: size },
        {
          $lookup: {
            from: "users",
            localField: "memberId",
            foreignField: "_id",
            as: "member",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$member" },
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor",
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$doctor" },
        {
          $lookup: {
            from: "children",
            localField: "childIds",
            foreignField: "_id",
            as: "children",
          },
        },
      ]);

      const totalRequest = await RequestModel.countDocuments(searchQuery);
      return {
        requests,
        page,
        total: totalRequest,
        totalPages: Math.ceil(totalRequest / size),
      };
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async updateRequest(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IRequest> {
    try {
      const request = await RequestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        data,
        { session, new: true }
      );

      if (!request) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Request not found"
        );
      }

      return request;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async deleteRequest(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IRequest> {
    try {
      const request = await RequestModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
        { session, new: true }
      );

      if (!request) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Request not found"
        );
      }

      return request;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async validateRequestDailyLimit(userId: string): Promise<void> {
    try {
      const now = new Date();
      const today = now.setHours(0, 0, 0, 0); //0h today
      const tmr = new Date();
      tmr.setDate(now.getDate() + 1);
      tmr.setHours(0, 0, 0, 0);

      const requestNumber = await RequestModel.countDocuments({
        memberId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: today, $lte: tmr },
      });

      const config = await ConfigModel.findOne({
        key: "DAILY_CONSULTAION_REQUEST_LIMIT",
      });
      const maxRequest = parseInt((config as IConfig)?.value) || 5;
      if (requestNumber >= maxRequest) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "You have exceeded the daily limit number of request"
        );
      }
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getOldRequest(): Promise<mongoose.Types.ObjectId[]> {
    try {
      const config = await ConfigModel.findOne({
        key: "REQUEST_MAX_PENDING_TIME",
      });
      const maxPendingTime = parseInt((config as IConfig)?.value) || 14;
      const daysPending = maxPendingTime;

      const requests: mongoose.Types.ObjectId[] = await RequestModel.find(
        {
          createdAt: {
            $lt: new Date(Date.now() - daysPending * 24 * 60 * 60 * 1000),
          },
          isDeleted: false,
          status: RequestStatus.Pending,
        },
        { _id: 1 }
      );

      return requests.map((req) => req._id); // Return array of ObjectIds
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async handleOldRequest(requestIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await RequestModel.updateMany(
        { _id: { $in: requestIds } },
        { $set: { status: RequestStatus.Canceled } }
      );
    } catch (error) {
      if (error instanceof Error || error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default RequestRepository;
