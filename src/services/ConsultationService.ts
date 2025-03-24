import { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
// import ConsultationRepository from "../repositories/ConsultationRepository";
import { returnDataConsultation } from "../repositories/ConsultationRepository";
// import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import { ConsultationStatus, IConsultation } from "../interfaces/IConsultation";
import { IConsultationService } from "../interfaces/services/IConsultationService";
import { IConsultationRepository } from "../interfaces/repositories/IConsultationRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";

class ConsultationService implements IConsultationService {
  private consultationRepository: IConsultationRepository;
  private userRepository: IUserRepository;
  private database: Database;

  constructor(
    consultationRepository: IConsultationRepository,
    userRepository: IUserRepository
  ) {
    this.consultationRepository = consultationRepository;
    this.userRepository = userRepository;
    this.database = Database.getInstance();
  }

  updateConsultationStatus = async (
    id: string,
    status: string,
    requesterId: string,
    cronJob?: boolean
  ): Promise<IConsultation> => {
    const session = await this.database.startTransaction();
    try {
      if (!cronJob) {
        const checkUser = await this.userRepository.getUserById(
          requesterId,
          false
        );

        if (!checkUser) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "User not found"
          );
        }

        if (![UserEnum.ADMIN].includes(checkUser.role)) {
          const checkConsultation =
            await this.consultationRepository.getConsultation(id, false);

          if (!checkConsultation) {
            throw new CustomException(
              StatusCodeEnum.NotFound_404,
              "Consultation not found"
            );
          }

          if (
            checkConsultation.requestDetails.memberId.toString() !== requesterId
          ) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "You are not authorized to update consultation status"
            );
          }
        }
      }
      const consultation = await this.consultationRepository.updateConsultation(
        id as string,
        {
          status,
        },
        session
      );

      await this.database.commitTransaction(session);

      return consultation;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      session.endSession();
    }
  };

  getConsultation = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<IConsultation> => {
    try {
      let ignoreDeleted = false;
      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }
      const notAdmin = ![UserEnum.ADMIN].includes(requester.role);

      if (!notAdmin) {
        ignoreDeleted = true;
      }

      const consultation = await this.consultationRepository.getConsultation(
        id,
        ignoreDeleted
      );

      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      const notMember =
        consultation.requestDetails.memberId.toString() !== requesterId;

      const notDoctor =
        consultation.requestDetails.doctorId.toString() !== requesterId;

      if (notAdmin && notDoctor && notMember) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to view this data"
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
  };

  getConsultations = async (
    query: IQuery,
    status: string,
    requesterId: string
  ): Promise<returnDataConsultation> => {
    try {
      let ignoreDeleted = false;

      const requester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!requester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }
      const notAdmin = ![UserEnum.ADMIN].includes(requester.role);

      if (!notAdmin) {
        ignoreDeleted = true;
      }

      const consultations = await this.consultationRepository.getConsultations(
        query,
        ignoreDeleted,
        status
      );

      return consultations;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getConsultationsByUserId = async (
    query: IQuery,
    status: string,
    userId: string | ObjectId,
    requesterId: string,
    as: "MEMBER" | "DOCTOR"
  ): Promise<returnDataConsultation> => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const notAdmin = ![UserEnum.ADMIN].includes(checkRequester.role);

      if (notAdmin) {
        //requesting someone else's data
        if (requesterId.toString() !== userId.toString()) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to view this data"
          );
        }

        const notDoctor = checkRequester.role !== UserEnum.DOCTOR;
        const notMember = checkRequester.role !== UserEnum.MEMBER;

        //request a doctor data when not doctor
        if (as === "DOCTOR" && notDoctor) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to view this data"
          );
        }

        //request client data when not client
        if ((!as || as === "MEMBER") && notMember) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to view this data"
          );
        }
      }

      if (!notAdmin) {
        ignoreDeleted = true;
      }

      const consultations =
        await this.consultationRepository.getConsultationsByUserId(
          query,
          ignoreDeleted,
          userId as string,
          status,
          as
        );

      return consultations;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  deleteConsultation = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<IConsultation> => {
    const session = await this.database.startTransaction();
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }
      const notAdmin = ![UserEnum.ADMIN].includes(checkRequester.role);

      const consultation = await this.consultationRepository.getConsultation(
        id,
        false
      );
      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      const notOwner =
        consultation.requestDetails.memberId.toString() !== requesterId;

      if (notOwner && notAdmin) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to perform this action"
        );
      }

      if (consultation.status !== ConsultationStatus.Ended) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can't delete an ongoing consultation"
        );
      }

      const deletedConsultation =
        await this.consultationRepository.deleteConsultation(
          id as string,
          session
        );

      await this.database.commitTransaction(session);

      return deletedConsultation;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      session.endSession();
    }
  };
}

export default ConsultationService;
