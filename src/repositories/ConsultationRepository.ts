import mongoose, { ObjectId } from "mongoose";
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
      isDeleted?: boolean;
    };

    try {
      const { page, size, order, sortBy } = query;

      const searchQuery: searchQuery = {};

      if (ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";

      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const skip = (page - 1) * size;

      const consultations = await ConsultationModel.aggregate([
        {
          $match: searchQuery,
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: size },
      ]);

      if (consultations.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No consultation found"
        );
      }

      const totalConsultation = await ConsultationModel.countDocuments(
        searchQuery
      );

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

  async getConsultationsByUserId(
    query: IQuery,
    ignoreDeleted: boolean,
    userId: string,
    as: "MEMBER" | "DOCTOR"
  ) {}

  async updateConsultation(
    id: string,
    data: object,
    session?: mongoose.ClientSession
  ) {
    try {
      const consultation = await ConsultationModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
        },
        data,
        { session, new: true }
      );

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

  async deleteConsultation(id: string, session?: mongoose.ClientSession) {
    try {
      const consultation = await ConsultationModel.findOneAndUpdate(
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
}

export default ConsultationRepository;
