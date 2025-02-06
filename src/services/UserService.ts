import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
import { IUser } from "../interfaces/IUser";
import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";
import SessionService from "./SessionService";
import { IQuery } from "../interfaces/IQuery";
import { returnData } from "../repositories/UserRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";

class UserService {
  private userRepository: UserRepository;
  private sessionService: SessionService;
  private database: Database;
  private membershipPackageRepository: MembershipPackageRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionService = new SessionService();
    this.database = Database.getInstance();
    this.membershipPackageRepository = new MembershipPackageRepository();
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

      // Check if a super admin is trying to change their own role or another super admin's role
      if (requesterRole === UserEnum.SUPER_ADMIN) {
        if (role === UserEnum.SUPER_ADMIN) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Only one super admin allowed"
          );
        }
      }

      // If the requester is an admin, they cannot change another admin's role
      if (requesterRole === UserEnum.ADMIN) {
        if (role === UserEnum.ADMIN || role === UserEnum.SUPER_ADMIN) {
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

      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
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
    type: string,
    requesterId: string
  ): Promise<IUser> => {
    try {
      const session = await this.database.startTransaction();
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

      let data;
      let user: IUser;

      switch (type) {
        case "doctor":
          data = { name, password, phoneNumber, email, role: 3 };
          user = await this.userRepository.createDoctor(data, session);
          break;

        case "admin":
          if (checkUser.role === UserEnum.ADMIN) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Admins cannot create another admin"
            );
          }
          data = { name, password, role: 1, email, phoneNumber };
          user = await this.userRepository.createAdmin(data, session);
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "User type not supported"
          );
      }
      await this.database.commitTransaction();
      return user;
    } catch (error) {
      await this.database.abortTransaction();
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
  ): Promise<IUser | CustomException> => {
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
      ignoreDeleted = [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
        checkRequester.role
      );
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

      if (id.toString() === requesterId.toString()) {
        return checkUser;
      }

      switch (checkRequester?.role) {
        //user cant get indivitual user, can get other role
        case UserEnum.MEMBER:
          if (checkUser?.role === UserEnum.MEMBER) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "User can not get other users' info"
            );
          }
          return checkUser;

        //everyone can get doctor
        case UserEnum.DOCTOR:
          return checkUser;

        //admin can get admins and super admin
        case UserEnum.ADMIN:
          if (
            ![UserEnum.SUPER_ADMIN, UserEnum.ADMIN].includes(checkUser?.role)
          ) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "You do not have the authorization to perform this action"
            );
          }
          return checkUser;

        //get all
        case UserEnum.SUPER_ADMIN:
          return checkUser;

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Your role is not supported"
          );
      }
    } catch (error) {
      await this.database.abortTransaction();
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
    ignoreDeleted = [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
      checkRequester.role
    );
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
            [
              UserEnum.MEMBER,
              UserEnum.DOCTOR,
              UserEnum.ADMIN,
              UserEnum.SUPER_ADMIN,
            ]
          );
          break;
        case UserEnum.SUPER_ADMIN:
          users = await this.userRepository.getAllUsersRepository(
            Query,
            ignoreDeleted,
            [
              UserEnum.MEMBER,
              UserEnum.DOCTOR,
              UserEnum.ADMIN,
              UserEnum.SUPER_ADMIN,
            ]
          );
          break;
        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Your role is not supported"
          );
      }
      return users;
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

  updateUser = async (
    id: string | ObjectId,
    requesterId: string | ObjectId,
    data: {
      name: string;
    }
  ) => {
    const session = await this.database.startTransaction();
    const ignoreDeleted = false;
    try {
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

      if (checkUser.id === requesterId) {
        const user = await this.userRepository.updateUserById(
          id as string,
          data
        );
        await this.database.commitTransaction();
        return user;
      }

      switch (checkRequester?.role) {
        case UserEnum.ADMIN:
          if (checkUser?.role === UserEnum.DOCTOR) {
            const user = await this.userRepository.updateUserById(
              id as string,
              data,
              session
            );
            await this.database.commitTransaction();
            return user;
          }
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Admin can only update doctor"
          );

        case UserEnum.SUPER_ADMIN:
          if ([UserEnum.DOCTOR, UserEnum.ADMIN].includes(checkUser?.role)) {
            const user = await this.userRepository.updateUserById(
              id as string,
              data,
              session
            );
            await this.database.commitTransaction();
            return user;
          }
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Super admin can only update doctor, admin"
          );

        default:
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have the authorization to perform this action"
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
  };

  deleteUser = async (
    id: string | ObjectId,
    requesterId: string | ObjectId
  ) => {
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
            await this.database.commitTransaction();
            return user;
          }

          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Admin can only delete doctor"
          );

        case UserEnum.SUPER_ADMIN:
          if ([UserEnum.ADMIN, UserEnum.DOCTOR].includes(checkUser?.role)) {
            const user = await this.userRepository.deleteUserById(id as string);
            return user;
          }
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Super admin can only delete admin and doctor"
          );
        default:
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "You do not have the authorization to perform this action"
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
  };

  updatesubscription = async (
    id: string | ObjectId,
    membershipPackageId: string | mongoose.Types.ObjectId
  ) => {
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
        subscription.futureMembership = membershipPackageObjectId;
      } else {
        subscription.currentPlan = membershipPackageObjectId;
        subscription.tier = checkMembershipPackage.tier;
        subscription.startDate = new Date();
        subscription.endDate = new Date(
          Date.now() + 3600 * 24 * checkMembershipPackage.duration.value * 1000
        );
      }
      const user = await this.userRepository.updateUserById(
        id as string,
        {
          ...checkUser,
          subscription: subscription,
        },
        session
      );

      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default UserService;
