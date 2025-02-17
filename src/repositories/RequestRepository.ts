import mongoose, { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import RequestModel from "../models/RequestModel";
import { IQuery } from "../interfaces/IQuery";
import { RequestStatus } from "../interfaces/IRequest";

class RequestRepository {
  async createRequest(data: object, session?: mongoose.ClientSession) {
    try {
      const request = await RequestModel.create(data, { session });
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

  async getRequest(id: string | ObjectId) {
    try {
      const request = await RequestModel.findOne({
        _id: id,
        isDeleted: false,
      });

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

  async getAllRequest(
    query: IQuery,
    ignoreDeleted: boolean,
    status?: RequestStatus
  ) {
    type SearchQuery = {
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: RequestStatus;
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
    status?: RequestStatus,
    as?: "MEMBER" | "DOCTER"
  ) {
    type SearchQuery = {
      memberId?: mongoose.Types.ObjectId;
      doctorId?: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: RequestStatus;
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

      if (as === "DOCTER") {
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
  ) {
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

  async deleteRequest(id: string, session?: mongoose.ClientSession) {
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
}

export default RequestRepository;
