import mongoose, { ObjectId, Types } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import ConsultationModel from "../models/ConsultationModel";
import { IQuery } from "../interfaces/IQuery";
import { ConsultationStatus } from "../interfaces/IConsultation";
import ConsultationMessageModel from "../models/ConsultationMessageModel";

class ConsultationRepository {
  async createConsultation(data: object, session?: mongoose.ClientSession) {
    try {
      const consultation = await ConsultationModel.create([data], { session });
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

      const consultation = await ConsultationModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "requests",
            localField: "requestId",
            foreignField: "_id",
            as: "requestDetails",
          },
        },
        { $unwind: "$requestDetails" },
      ]);

      if (consultation.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      return consultation[0];
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

  async getConsultations(
    query: IQuery,
    ignoreDeleted: boolean,
    status: string
  ) {
    type searchQuery = {
      isDeleted?: boolean;
      status?: { $eq: string };
    };

    try {
      const { page, size, order, sortBy } = query;

      const searchQuery: searchQuery = {};

      if (ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      if (status) {
        searchQuery.status = { $eq: status };
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";

      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const skip = (page - 1) * size;

      const consultations = await ConsultationModel.aggregate([
        {
          $match: searchQuery,
        },
        {
          $lookup: {
            from: "requests",
            localField: "requestId",
            foreignField: "_id",
            as: "requestDetails",
          },
        },
        { $unwind: "$requestDetails" },
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
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ) {
    type searchQuery = {
      "requestDetails.title"?: { $eq: string };
      "requestDetails.memberId"?: mongoose.Types.ObjectId;
      "requestDetails.doctorId"?: mongoose.Types.ObjectId;
      isDeleted?: boolean;
      status?: { $eq: string };
    };

    try {
      const { page, size, search, order, sortBy } = query;

      // Define Match Query (Pre-Lookup)
      const searchQuery: searchQuery = {};
      if (!ignoreDeleted) searchQuery.isDeleted = false;
      if (status) searchQuery.status = { $eq: status };

      // Define User Role Query (Post-Lookup)
      const userQuery: searchQuery = {};
      if (as === "DOCTOR") {
        userQuery["requestDetails.doctorId"] = new mongoose.Types.ObjectId(
          userId
        );
      } else {
        userQuery["requestDetails.memberId"] = new mongoose.Types.ObjectId(
          userId
        );
      }

      // Apply Search Filter
      if (search) {
        userQuery["requestDetails.title"] = { $eq: search };
      }

      // Sorting Setup
      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      const skip = (page - 1) * size;

      // Aggregation Pipeline (Shared)
      const basePipeline = [
        { $match: searchQuery }, // Match Consultation Conditions
        {
          $lookup: {
            from: "requests",
            localField: "requestId",
            foreignField: "_id",
            as: "requestDetails",
          },
        },
        { $unwind: "$requestDetails" }, // Flatten Lookup Result
        { $match: userQuery }, // Filter by user (Doctor/Member)
      ];

      // Fetch Paginated Results
      const consultations = await ConsultationModel.aggregate([
        ...basePipeline,
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: size },
      ]);

      if (consultations.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No consultation found for this user"
        );
      }

      // Get Total Count After Filtering
      const totalCountResult = await ConsultationModel.aggregate([
        ...basePipeline,
        { $count: "total" },
      ]);

      const totalConsultation =
        totalCountResult.length > 0 ? totalCountResult[0].total : 0;

      return {
        consultations,
        page,
        totalConsultation,
        totalPages: Math.ceil(totalConsultation / size),
      };
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

  async getOldConsultation() {
    try {
      const INACTIVITY_LIMIT =
        (parseInt(process.env.INACTIVE_CONSULTATION_LIMIT as string) || 14) *
        24 *
        60 *
        60 *
        1000;
      const inactivityThreshold = new Date(Date.now() - INACTIVITY_LIMIT);

      // Step 1: Get the latest message for each consultation
      const latestMessages = await ConsultationMessageModel.aggregate([
        { $match: { isDeleted: false } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$consultationId",
            latestMessageTime: { $first: "$createdAt" },
          },
        },
      ]);

      // Step 2: Get all ongoing consultations
      const consultations = await ConsultationModel.find({
        status: ConsultationStatus.OnGoing,
      }).select("_id createdAt");

      // Step 3: Determine inactive consultations
      const inactiveConsultationIds = consultations
        .filter((consultation) => {
          const latestMessage = latestMessages.find((msg) =>
            msg._id.equals(consultation._id)
          );
          const lastActivityTime = latestMessage
            ? latestMessage.latestMessageTime
            : consultation.createdAt; // Use consultation.createdAt if no messages exist
          return lastActivityTime < inactivityThreshold; // Compare with inactivity limit
        })
        .map((consultation) => consultation._id);

      return inactiveConsultationIds;
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

  async handleOldConsultations(ids: Types.ObjectId[]) {
    try {
      await ConsultationModel.updateMany(
        {
          _id: { $in: ids },
        },
        { $set: { status: ConsultationStatus.Ended } }
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

export default ConsultationRepository;
