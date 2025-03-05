import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
import { ConsultationStatus } from "../interfaces/IConsultation";
import { IQuery } from "../interfaces/IQuery";
import ConsultationMessageRepository from "../repositories/ConsultationMessageRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";
import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";
import { cleanUpFileArray, extractAndReplaceImages } from "../utils/fileUtils";

class ConsultationMessageService {
  private consultationRepository: ConsultationRepository;
  private database: Database;
  private userRepository: UserRepository;
  private consultationMessageRepository: ConsultationMessageRepository;

  constructor() {
    this.consultationRepository = new ConsultationRepository();
    this.database = Database.getInstance();
    this.userRepository = new UserRepository();
    this.consultationMessageRepository = new ConsultationMessageRepository();
  }

  createConsultationMessage = async (
    consultationId: string,
    requesterId: string,
    message: string,
    attachments: [string]
  ) => {
    const session = await this.database.startTransaction();
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!requesterId) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      if (
        ![UserEnum.DOCTOR, UserEnum.MEMBER].includes(
          checkRequester?.role as number
        )
      ) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Your role is not supported to perform this action"
        );
      }

      //consultationExistence
      const checkConsultation =
        await this.consultationRepository.getConsultation(
          consultationId,
          false
        );
      
      if (!checkConsultation) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation not found");
      }


      if (checkConsultation.status !== ConsultationStatus.OnGoing) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Consultation has ended"
        );
      }

      const notMember =
        checkConsultation.requestDetails.memberId.toString() !== requesterId;

      const notDoctor =
        checkConsultation.requestDetails.doctorId.toString() !== requesterId;

      if (notDoctor && notMember) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to perform this action"
        );
      }

      const formattedMessage = extractAndReplaceImages(message, attachments);

      // console.log(attachments);

      const consultationMessage =
        await this.consultationMessageRepository.createConsultationMessage(
          {
            consultationId: consultationId,
            sender: requesterId,
            message: formattedMessage,
            attachments,
          },
          session
        );

      await this.database.commitTransaction(session);

      return consultationMessage;
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

  getConsultationMessage = async (id: string, requesterId: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const notAdmin = ![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
        checkRequester?.role
      );

      if (!notAdmin) {
        ignoreDeleted = true;
      }

      const consultationMessage =
        await this.consultationMessageRepository.getConsultationMessage(
          id,
          ignoreDeleted
        );
      if (!consultationMessage) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation message not found")
      }

      if (notAdmin) {
        const checkConsultation =
          await this.consultationRepository.getConsultation(
            consultationMessage.consultationId,
            ignoreDeleted
          );
      
      if (!checkConsultation) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation not found");
      }

        const notDoctor =
          requesterId !== checkConsultation.requestDetails.doctorId.toString();
        const notMember =
          requesterId !== checkConsultation.requestDetails.memberId.toString();

        if (notDoctor && notMember) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to view this message"
          );
        }
      }

      return consultationMessage;
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

  getConsultationMessages = async (
    consultationId: string,
    query: IQuery,
    requesterId: string
  ) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const notAdmin = ![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
        checkRequester?.role
      );

      if (!notAdmin) {
        ignoreDeleted = true;
      }

      if (notAdmin) {
        const checkConsultation =
          await this.consultationRepository.getConsultation(
            consultationId,
            ignoreDeleted
          );
      
      if (!checkConsultation) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation not found");
      }

        const notDoctor =
          requesterId !== checkConsultation.requestDetails.doctorId.toString();
        const notMember =
          requesterId !== checkConsultation.requestDetails.memberId.toString();

        if (notDoctor && notMember) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to view this message"
          );
        }
      }

      const consultationMessages =
        await this.consultationMessageRepository.getConsultationMessages(
          consultationId,
          query,
          ignoreDeleted
        );

      return consultationMessages;
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

  updateConsultationMessage = async (
    id: string,
    requesterId: string,
    message: string,
    attachments: [string]
  ) => {
    const session = await this.database.startTransaction();
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        false
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const notAdmin = ![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
        checkRequester?.role
      );

      const consultationMessage =
        await this.consultationMessageRepository.getConsultationMessage(
          id,
          false
        );
      
      if (!consultationMessage) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation message not found")
      }

      if (requesterId !== consultationMessage.sender.toString() && notAdmin) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to perform this action"
        );
      }

      const formattedMessage = extractAndReplaceImages(message, attachments);
      const updatedMessage =
        await this.consultationMessageRepository.updateConsultationMessage(
          id,
          {
            message: formattedMessage,
            attachments,
          },
          session
        );

      if (
        consultationMessage.attachments &&
        consultationMessage.attachments.length > 0
      ) {
        await cleanUpFileArray(consultationMessage.attachments, "update");
      }

      await this.database.commitTransaction(session);

      return updatedMessage;
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

  deleteConsultationMessage = async (id: string, requesterId: string) => {
    const session = await this.database.startTransaction();
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId as string,
        false
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const notAdmin = ![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
        checkRequester?.role
      );

      const consultationMessage =
        await this.consultationMessageRepository.getConsultationMessage(
          id,
          false
        );
      
      if (!consultationMessage) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Consultation message not found")
      }

      if (notAdmin && consultationMessage.sender.toString() !== requesterId) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to perform this action"
        );
      }

      await this.consultationMessageRepository.updateConsultationMessage(
        id,
        { isDeleted: true },
        session
      );

      await cleanUpFileArray(consultationMessage.attachments, "update");

      await this.database.commitTransaction(session);
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

export default ConsultationMessageService;
