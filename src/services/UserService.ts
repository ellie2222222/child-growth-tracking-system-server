import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
import { ISubscription, IUser } from "../interfaces/models/IUser";
import { IDoctor } from "../repositories/UserRepository";

import Database from "../utils/database";

import { IQuery } from "../interfaces/models/IQuery";
import { returnData } from "../repositories/UserRepository";

import bcrypt from "bcrypt";
import { ConsultationStatus, IConsultation } from "../interfaces/models/IConsultation";
import { IUserService } from "../interfaces/services/IUserService";
import { IConsultationRepository } from "../interfaces/repositories/IConsultationRepository";

import { IMembershipPackageRepository } from "../interfaces/repositories/IMembershipPackageRepository";
import { ISessionService } from "../interfaces/services/ISessionService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { cleanUpFile } from "../utils/fileUtils";

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private sessionService: ISessionService;
  private membershipPackageRepository: IMembershipPackageRepository;
  private consultationRepository: IConsultationRepository;
  private database: Database;

  constructor(
    userRepository: IUserRepository,
    sessionService: ISessionService,
    membershipPackageRepository: IMembershipPackageRepository,
    consultationRepository: IConsultationRepository
  ) {
    this.userRepository = userRepository;
    this.sessionService = sessionService;
    this.membershipPackageRepository = membershipPackageRepository;
    this.consultationRepository = consultationRepository;
    this.database = Database.getInstance();
  }

  /**
   * Verify the user's email using the token.
   * @param userId - The target user ID
   * @param role - Role to be updated
   * @param requesterRole - The requester role
   * @returns A void promise.
   */
  updateRole = async (
    userId: string,
    role: number,
    requesterRole: number
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    const ignoreDeleted = false;
    try {
      const user = await this.userRepository.getUserById(userId, ignoreDeleted);

      // Check if user exists
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Check if the requester is trying to update their own role
      if (userId === user._id) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Cannot update own role"
        );
      }

      // Check if the user is attempting to change to the same role
      if (user.role === role) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Role is already the same"
        );
      }

      // If the requester is an admin, they cannot change another admin's role
      if (requesterRole === UserEnum.ADMIN) {
        if (role === UserEnum.ADMIN) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Admins cannot change another admin's role"
          );
        }
      }

      // Update the user's role
      const updateData: Partial<IUser> = { role };
      await this.userRepository.updateUserById(userId, updateData, session);

      await this.sessionService.deleteSessionsByUserId(userId);

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  createUser = async (
    name: string,
    password: string,
    phoneNumber: string,
    email: string,
    role: number,
    requesterId: string
  ): Promise<IUser> => {
    const session = await this.database.startTransaction();
    try {
      const ignoreDeleted = false;
      const checkUser = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      if (checkUser.role !== UserEnum.ADMIN) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "Only admins can create new users"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const data = {
        name: name,
        password: hashedPassword,
        phoneNumber,
        email,
        role: role,
      };

      const user: IUser = await this.userRepository.createUser(data, session);

      await this.database.commitTransaction(session);
      return user;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getUserById = async (
    id: string | ObjectId,
    requesterId: string | ObjectId
  ): Promise<IDoctor | IUser | CustomException> => {
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
      ignoreDeleted = [UserEnum.ADMIN].includes(checkRequester.role);
      let checkUser = await this.userRepository.getUserById(
        id as string,
        ignoreDeleted
      );
      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (checkUser.role === UserEnum.DOCTOR) {
        let totalRating = 0;
        let totalRatingCount = 0;
        const consultations =
          await this.consultationRepository.getAllConsultationsByDoctorId(
            id as string
          );

        if ((consultations || []).length > 0) {
          consultations.map((c) => {
            if (c.rating > 0) {
              totalRating += c.rating;
              totalRatingCount += 1;
            }
          });
        } else {
          totalRating = 0;
          totalRatingCount = 1;
        }

        checkUser = {
          ...checkUser.toObject(),
          rating: totalRating / totalRatingCount,
        };
      }

      if (id.toString() === requesterId.toString()) {
        return checkUser as IUser | IDoctor;
      }

      switch (checkRequester?.role) {
        //user cant get indivitual user, can get other role
        case UserEnum.MEMBER:
          if (
            [UserEnum.MEMBER, UserEnum.ADMIN].includes(
              checkUser?.role as number
            )
          ) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "User can not get other users' info"
            );
          }
          return checkUser as IUser | IDoctor;

        case UserEnum.DOCTOR: {
          if ([UserEnum.ADMIN].includes(checkUser?.role as number)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Doctor can't view admin info"
            );
          }
          return checkUser as IUser | IDoctor;
        }

        //admin can get admins and super admin
        case UserEnum.ADMIN:
          if ([UserEnum.ADMIN].includes(checkUser?.role as number)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Admin can't view other admin info"
            );
          }
          return checkUser as IUser | IDoctor;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Your role is not supported"
          );
      }
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }

      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getUsers = async (
    Query: IQuery,
    requesterId: string | ObjectId
  ): Promise<returnData> => {
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

    ignoreDeleted = [UserEnum.ADMIN].includes(checkRequester.role);
    try {
      let users;
      switch (checkRequester?.role) {
        case UserEnum.MEMBER:
          users = await this.userRepository.getAllUsersRepository(
            Query,
            ignoreDeleted,
            UserEnum.DOCTOR
          );
          break;
        case UserEnum.DOCTOR:
          users = await this.userRepository.getAllUsersRepository(
            Query,
            ignoreDeleted,
            [UserEnum.MEMBER, UserEnum.DOCTOR]
          );
          break;
        case UserEnum.ADMIN:
          users = await this.userRepository.getAllUsersRepository(
            Query,
            ignoreDeleted,
            Query.role === ""
              ? undefined
              : Query.role ?? [UserEnum.MEMBER, UserEnum.DOCTOR]
          );
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Your role is not supported"
          );
      }

      const formatedUsers = await Promise.all(
        users.users.map(async (user) => {
          if (user.role === UserEnum.DOCTOR) {
            let totalRating = 0;
            let totalRatingCount = 0;
            const consultations =
              await this.consultationRepository.getAllConsultationsByDoctorId(
                user._id as string
              );

            if ((consultations || []).length > 0) {
              consultations.map((c) => {
                if (c.rating > 0) {
                  totalRating += c.rating;
                  totalRatingCount += 1;
                }
              });
            } else {
              totalRating = 0;
              totalRatingCount = 0;
            }

            return {
              ...(typeof user.toObject === "function" ? user.toObject() : user),
              rating: totalRating / totalRatingCount,
            };
          }

          return user;
        })
      );

      return {
        users: formatedUsers as unknown as IDoctor[] | IUser[],
        total: users.total,
        page: users.page,
        totalPages: users.totalPages,
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
  };

  updateUser = async (
    id: string | ObjectId,
    requesterId: string | ObjectId,
    name?: string,
    role?: number,
    phoneNumber?: string,
    avatar?: string
  ): Promise<IUser | null> => {
    const session = await this.database.startTransaction();
    try {
      const requester = await this.userRepository.getUserById(
        requesterId as string,
        false
      );
      if (!requester)
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );

      const user = await this.userRepository.getUserById(id as string, false);

      if (!user)
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );

      const isAdmin = requester.role === UserEnum.ADMIN;
      const isSelf = id === requesterId;

      const updateData: Partial<IUser> = {};

      if (role !== undefined) {
        if (!isAdmin) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have the authority to perform this action"
          );
        } else {
          updateData.role = role;
        }
      }

      if (!isAdmin && !isSelf) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You do not have the authority to perform this action"
        );
      } else {
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (avatar) updateData.avatar = avatar;
      }

      const updatedUser = await this.userRepository.updateUserById(
        id as string,
        updateData,
        session
      );
      //Object assign did not work

      await this.database.commitTransaction(session);
      await cleanUpFile(user.avatar, "update");
      return updatedUser;
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error instanceof CustomException
        ? error
        : new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Internal Server Error"
          );
    }
  };

  deleteUser = async (
    id: string | ObjectId,
    requesterId: string | ObjectId
  ): Promise<boolean> => {
    const session = await this.database.startTransaction();
    try {
      const ignoreDeleted = false;
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

      const checkUser = await this.userRepository.getUserById(
        id as string,
        ignoreDeleted
      );

      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }
      switch (checkRequester?.role) {
        case UserEnum.ADMIN:
          if (checkUser?.role === UserEnum.DOCTOR) {
            const user = await this.userRepository.deleteUserById(id as string);
            await this.database.commitTransaction(session);
            return user;
          }

          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Admin can only delete doctor"
          );

        default:
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have the authorization to perform this action"
          );
      }
    } catch (error) {
      await session.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  updateSubscription = async (
    id: string | ObjectId,
    membershipPackageId: string | mongoose.Types.ObjectId
  ): Promise<IUser | null> => {
    const session = await this.database.startTransaction();
    try {
      const checkUser = await this.userRepository.getUserById(
        id as string,
        false
      );

      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkMembershipPackage =
        await this.membershipPackageRepository.getMembershipPackage(
          membershipPackageId as string,
          true
        );

      if (!checkMembershipPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership package not found in database"
        );
      }

      const subscription = checkUser.subscription;
      const membershipPackageObjectId = new mongoose.Types.ObjectId(
        membershipPackageId as string
      );
      if (checkUser.subscription.currentPlan !== null) {
        subscription.futurePlan = membershipPackageObjectId;
      } else {
        subscription.currentPlan = membershipPackageObjectId;
        subscription.startDate = new Date();
        subscription.endDate = new Date(
          Date.now() + 3600 * 24 * checkMembershipPackage.duration.value * 1000
        );
      }

      const data = {
        subscription: subscription,
      };

      const user = await this.userRepository.updateUserById(
        id as string,
        data,
        session
      );

      await session.commitTransaction(session);

      return user;
    } catch (error) {
      await session.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  removeCurrentSubscription = async (
    userId: string | ObjectId,
    requesterId: string
  ): Promise<IUser | null> => {
    const session = await this.database.startTransaction();
    try {
      if (requesterId !== userId.toString()) {
        throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }
      const checkUser = await this.userRepository.getUserById(
        userId as string,
        false
      );

      if (!checkUser) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (checkUser.subscription.currentPlan === null) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User has no subscription"
        );
      }

      const subscription = checkUser.subscription;

      if (checkUser.subscription.futurePlan !== null) {
        const checkMembershipPackage =
          await this.membershipPackageRepository.getMembershipPackage(
            checkUser.subscription.futurePlan as unknown as string,
            true
          );

        if (!checkMembershipPackage) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Membership package not found in database"
          );
        }

        subscription.currentPlan = checkUser.subscription.futurePlan;
        subscription.startDate = new Date();
        subscription.endDate = new Date(
          Date.now() + 3600 * 24 * checkMembershipPackage.duration.value * 1000
        );
        subscription.futurePlan = null;
      } else {
        subscription.endDate = null;
        subscription.startDate = null;
        subscription.currentPlan = null;
      }

      const data = {
        subscription: subscription,
      };

      const user = await this.userRepository.updateUserById(
        userId as string,
        data,
        session
      );

      await this.database.commitTransaction(session);

      return user;
    } catch (error) {
      await session.abortTransaction(session);
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

  createConsultationRating = async (
    consultationId: string,
    requesterId: string,
    rating: number
  ): Promise<IConsultation> => {
    const session = await this.database.startTransaction();
    try {
      const consultation = await this.consultationRepository.getConsultation(
        consultationId,
        false
      );

      console.log(consultation);
      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      if (
        consultation.requestDetails.memberId.toString() !==
        requesterId.toString()
      ) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation"
        );
      }

      if (consultation.status !== ConsultationStatus.ENDED) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation because it has not ended yet"
        );
      }

      if (consultation.rating !== 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Please use the update rating to update consultation"
        );
      }

      const updatedConsultation =
        await this.consultationRepository.updateConsultation(
          consultationId,
          {
            rating: rating,
          },
          session
        );

      await this.database.commitTransaction(session);
      return updatedConsultation;
    } catch (error) {
      await session.abortTransaction(session);
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

  updateConsultationRating = async (
    consultationId: string,
    requesterId: string,
    rating: number
  ): Promise<IConsultation> => {
    const session = await this.database.startTransaction();
    try {
      const consultation = await this.consultationRepository.getConsultation(
        consultationId,
        false
      );

      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      if (
        consultation.requestDetails.memberId.toString() !==
        requesterId.toString()
      ) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation"
        );
      }

      if (consultation.status !== ConsultationStatus.ENDED) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation because it has not ended yet"
        );
      }

      if (consultation.rating === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "You need to have a rating before you can update it"
        );
      }
      const updatedConsultation =
        await this.consultationRepository.updateConsultation(
          consultationId,
          {
            rating: rating,
          },
          session
        );

      await this.database.commitTransaction(session);
      return updatedConsultation;
    } catch (error) {
      await session.abortTransaction(session);
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

  removeConsultationRating = async (
    consultationId: string,
    requesterId: string,
    rating: number
  ): Promise<IConsultation> => {
    const session = await this.database.startTransaction();
    try {
      const consultation = await this.consultationRepository.getConsultation(
        consultationId,
        false
      );

      console.log(consultationId);
      if (!consultation) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Consultation not found"
        );
      }

      if (
        consultation.requestDetails.memberId.toString() !==
        requesterId.toString()
      ) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation"
        );
      }

      if (consultation.status !== ConsultationStatus.ENDED) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You can not rate this consultation because it has not ended yet"
        );
      }

      if (consultation.rating === 0) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Consultation can not be deleted because it does not exist"
        );
      }
      const updatedConsultation =
        await this.consultationRepository.updateConsultation(
          consultationId,
          {
            rating: rating,
          },
          session
        );

      await this.database.commitTransaction(session);
      return updatedConsultation;
    } catch (error) {
      await session.abortTransaction(session);
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

export default UserService;
