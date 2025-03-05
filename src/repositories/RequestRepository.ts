import mongoose, { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import RequestModel from "../models/RequestModel";
import { IQuery } from "../interfaces/IQuery";
import dotenv from "dotenv";
import { IRequest, RequestStatus } from "../interfaces/IRequest";
import { IRequestRepository } from "../interfaces/repositories/IRequestRepository";
dotenv.config();

class RequestRepository implements IRequestRepository {
  async createRequest(data: object, session?: mongoose.ClientSession): Promise<IRequest> {
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

  async getRequest(id: string | ObjectId, ignoreDeleted: boolean): Promise<IRequest | null> {
    try {
      const searchQuery = ignoreDeleted
        ? { _id: new mongoose.Types.ObjectId(id as string) }
        : {
            _id: new mongoose.Types.ObjectId(id as string),
            isDeleted: false,
          };

      const request = await RequestModel.findOne(searchQuery);

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

  async getAllRequests(query: IQuery, ignoreDeleted: boolean, status?: string): Promise<object> {
    type SearchQuery = {
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: string;
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
        searchQuery.status = status;
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;

      const requests = await RequestModel.aggregate([
        {
          $match: searchQuery,
        },
        { $skip: skip },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);

      if (!requests) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "No requests found"
        );
      }

      return requests;
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
  ): Promise<object> {
    type SearchQuery = {
      memberId?: mongoose.Types.ObjectId;
      doctorId?: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: string;
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
        searchQuery.status = status;
      }

      if (as === "DOCTOR") {
        searchQuery.doctorId = new mongoose.Types.ObjectId(userId);
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
        { $skip: skip },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);

      if (!requests) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "No requests found"
        );
      }

      return requests;
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

  async deleteRequest(id: string, session?: mongoose.ClientSession): Promise<IRequest> {
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

      if (
        requestNumber >= (parseInt(process.env.DAILY_REQ_LIM as string) || 3)
      ) {
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
      const daysPending = parseInt(process.env.REQ_PEND as string) || 14;

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
