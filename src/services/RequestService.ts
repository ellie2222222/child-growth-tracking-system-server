import mongoose, { ObjectId } from "mongoose";
import RequestRepository from "../repositories/RequestRepository";
import UserRepository from "../repositories/UserRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/IQuery";
import { RequestStatus } from "../interfaces/IRequest";
import ChildRepository from "../repositories/ChildRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";

class RequestService {
  private requestRepository: RequestRepository;
  private userRepository: UserRepository;
  private database: Database;
  private childRepository: ChildRepository;
  private consultationRepository: ConsultationRepository;

  constructor() {
    this.requestRepository = new RequestRepository();
    this.userRepository = new UserRepository();
    this.database = Database.getInstance();
    this.childRepository = new ChildRepository();
    this.consultationRepository = new ConsultationRepository();
  }

  //validate child's existence, doctor existence with role
  createRequest = async (
    childIds: [string] | [ObjectId],
    doctorId: string | ObjectId,
    title: string,
    requesterId: string
  ) => {
    const session = await this.database.startTransaction();
    try {
      //daily limit
      await this.requestRepository.validateRequestDailyLimit(requesterId);

      //doctor existence
      const checkDoctor = await this.userRepository.getUserById(
        doctorId as string,
        false
      );

      if (!checkDoctor) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requested doctor not found"
        );
      }

      //doctor role
      if (checkDoctor?.role !== UserEnum.DOCTOR) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Requested doctor is must be a doctor"
        );
      }

      await Promise.all(
        //child existence
        childIds.map(async (childId) => {
          const checkChild = await this.childRepository.getChildById(
            childId as string,
            false
          );

          if (!checkChild) {
            throw new CustomException(
              StatusCodeEnum.NotFound_404,
              "Child not found"
            );
          }

          if (
            !checkChild.relationships.some(
              (relationship) => relationship.memberId.toString() === requesterId
            )
          ) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "You are not related to a child in your selected children"
            );
          }
        })
      );

      const checkUserChildren = await this.userRepository.getUserChildrenIds(
        requesterId
      );

      const formatedChildId = childIds.map((childId) => {
        if (
          !checkUserChildren.some(
            (child) => child._id.toString() === childId.toString()
          )
        ) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have access to this child in your current tier limit"
          );
        }

        return new mongoose.Types.ObjectId(childId as string);
      });

      const data = {
        memberId: new mongoose.Types.ObjectId(requesterId as string),
        childIds: formatedChildId,
        doctorId: new mongoose.Types.ObjectId(doctorId as string),
        title: title,
      };

      const request = await this.requestRepository.createRequest(data, session);

      await this.database.commitTransaction(session);
      return request;
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
      await session.endSession();
    }
  };

  getRequest = async (id: string | ObjectId, requesterId: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
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

      const request = await this.requestRepository.getRequest(
        id,
        ignoreDeleted
      );

      const notDoctor = request.doctorId.toString() !== requesterId;
      const notRequester = request.memberId.toString() !== requesterId;

      if (notDoctor && notRequester && notAdmin) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have access to view this request"
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
  };

  getRequestsByUserId = async (
    userId: string | ObjectId,
    requesterId: string,
    query: IQuery,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
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

      //isAdmin: get all even deleted and no futher validation
      if (!notAdmin) {
        ignoreDeleted = true;
      }

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

      const requests = await this.requestRepository.getRequestsByUserId(
        userId as string,
        query,
        ignoreDeleted,
        status,
        as
      );

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
  };

  //only admin can see => ignoreDeleted = true
  getAllRequests = async (query: IQuery, status?: string) => {
    try {
      const requests = await this.requestRepository.getAllRequests(
        query,
        true,
        status
      );

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
  };

  updateRequestStatus = async (
    id: string | ObjectId,
    requesterId: string,
    status: string
  ) => {
    const session = await this.database.startTransaction();
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
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

      const request = await this.requestRepository.getRequest(id, false);

      if (notAdmin) {
        switch (status) {
          //Not requested doctor => cant accept or reject
          case RequestStatus.Accepted:
            if (requesterId.toString() !== request.doctorId.toString()) {
              throw new CustomException(
                StatusCodeEnum.Forbidden_403,
                "You do not have access to perform this action"
              );
            }
            await this.consultationRepository.createConsultation(
              {
                requestId: request._id,
              },
              session
            );
            break;

          case RequestStatus.Rejected:
            if (requesterId.toString() !== request.doctorId.toString()) {
              throw new CustomException(
                StatusCodeEnum.Forbidden_403,
                "You do not have access to perform this action"
              );
            }
            break;

          //Not requester => cant cancel
          case RequestStatus.Canceled:
            if (requesterId.toString() !== request.memberId.toString()) {
              throw new CustomException(
                StatusCodeEnum.Forbidden_403,
                "You do not have access to perform this action"
              );
            }
            break;
          default:
            throw new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid status type"
            );
        }
      }

      if (request.status === status) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Request is already in the specified status"
        );
      }

      const UpdatedRequest = await this.requestRepository.updateRequest(
        id as string,
        {
          status,
        },
        session
      );
      await this.database.commitTransaction(session);
      return UpdatedRequest;
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
      await session.endSession();
    }
  };

  deleteRequest = async (id: string, requesterId: string) => {
    const session = await this.database.startTransaction();
    try {
      const request = await this.requestRepository.getRequest(
        id as string,
        false
      );

      if (request.memberId.toString() !== requesterId.toString()) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      const deletedRequest = await this.requestRepository.deleteRequest(id);

      await this.database.commitTransaction(session);
      return deletedRequest;
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
      await session.endSession();
    }
  };
}

export default RequestService;
