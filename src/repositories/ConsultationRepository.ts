import mongoose, { ObjectId, PipelineStage } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import ConsultationModel from "../models/ConsultationModel";
import { IQuery } from "../interfaces/IQuery";

class ConsultationRepository {
  async createConsultation(data: object, session?: mongoose.ClientSession) {
    try {
      const consultation = await ConsultationModel.create(data, { session });
      return consultation;
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

  async getConsultation(id: string | ObjectId, ignoreDeleted: boolean) {
    type searchQuery = {
      _id: mongoose.Types.ObjectId;
      isDeleted?: boolean;
    };
    try {
      const query: searchQuery = {
        _id: new mongoose.Types.ObjectId(id as string),
      };

      if (!ignoreDeleted) {
        query.isDeleted = false;
      }

      const consultation = await ConsultationModel.findOne(query);

      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      return consultation;
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

  async getConsultations(query: IQuery, ignoreDeleted: boolean) {
    type searchQuery = {
      "requestDetails.title"?: string;
      isDeleted?: boolean;
    };

    try {
      const { page, size, search, order, sortBy } = query;

      const searchQuery: searchQuery = {};

      if (ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";

      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const skip = (page - 1) * size;

      const pipeline: PipelineStage[] = [];
      if (search) {
        searchQuery["requestDetails.title"] = search;
        pipeline.push(
          {
            $lookup: {
              from: "Request",
              localField: "requestId",
              foreignField: "_id",
              as: "requestDetails",
            },
          },
          { $unwind: "$requestDetails" },
          { $match: searchQuery },
          {
            $project: {
              _id: 1,
              requestId: 1,
              status: 1,
              "requestDetails.memberId": 1,
              "requestDetails.childIds": 1,
              "requestDetails.doctorId": 1,
              "requestDetails.title": 1,
              "requestDetails.userFeedback": 1,
            },
          },
          { $skip: skip },
          {
            $sort: { [sortField]: sortOrder },
          }
        );
      } else {
        pipeline.push(
          { $match: searchQuery },
          { $skip: skip },
          {
            $sort: { [sortField]: sortOrder },
          }
        );
      }

      const consultations = await ConsultationModel.aggregate(pipeline);

      if (consultations.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No consultation found"
        );
      }

      const totalConsultation = await ConsultationModel.countDocuments(
        searchQuery
      ); //missing the aggregate to find title in request?

      return {
        consultations: consultations,
        page: page,
        totalConsultation: totalConsultation,
        totalPages: Math.ceil(totalConsultation / size),
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
}

export default ConsultationRepository;
