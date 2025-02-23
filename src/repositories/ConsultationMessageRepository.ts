import mongoose, { ClientSession, ObjectId } from "mongoose";
import ConsultationMessageModel from "../models/ConsultationMessageModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";

class ConsultationMessageRepository {
  async createConsultationMessage(
    data: object,
    session?: mongoose.ClientSession
  ) {
    try {
      const consultationMessage = await ConsultationMessageModel.create(
        [data],
        {
          session,
        }
      );

      return consultationMessage[0];
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

  async getConsultationMessages(
    consultationId: string | ObjectId,
    query: IQuery,
    ignoreDeleted: boolean
  ) {
    type searchQuery = {
      consultationId: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      message?: { $regex: string; $options: string };
    };

    try {
      const { page, size, search, order, sortBy } = query;
      const searchQuery: searchQuery = ignoreDeleted
        ? {
            consultationId: new mongoose.Types.ObjectId(
              consultationId as string
            ),
          }
        : {
            consultationId: new mongoose.Types.ObjectId(
              consultationId as string
            ),
            isDeleted: false,
          };

      if (search) {
        searchQuery.message = { $regex: search, $options: "i" };
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";

      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const consultationMessages = await ConsultationMessageModel.aggregate([
        { $match: searchQuery },
        { $sort: { [sortField]: sortOrder } },
        { $limit: page * size },
      ]);

      if (!consultationId) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "This consultation has no messages"
        );
      }

      const messageCount = await ConsultationMessageModel.countDocuments(
        searchQuery
      );
      return {
        ConsultationMessages: consultationMessages,
        Page: page,
        TotalMessages: messageCount,
        TotalPage: Math.ceil(messageCount / size),
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

  async getConsultationMessage(id: string | ObjectId, ignoreDeleted: boolean) {
    try {
      const searchQuery = ignoreDeleted
        ? { _id: new mongoose.Types.ObjectId(id as string) }
        : {
            _id: new mongoose.Types.ObjectId(id as string),
            isDeleted: false,
          };

      const message = await ConsultationMessageModel.findOne(searchQuery);

      if (!message) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Message not found"
        );
      }

      return message;
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

  async updateConsultationMessage(
    id: string,
    data: object,
    session?: ClientSession
  ) {
    try {
      const consultationMesssage =
        await ConsultationMessageModel.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false,
          },
          data,
          { session, new: true }
        );

      if (!consultationMesssage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Message not found"
        );
      }

      return consultationMesssage;
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

export default ConsultationMessageRepository;
