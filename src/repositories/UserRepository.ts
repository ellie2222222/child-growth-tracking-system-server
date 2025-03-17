import mongoose, { Types } from "mongoose";
import UserModel from "../models/UserModel";
import { IUser } from "../interfaces/IUser";
import { IQuery } from "../interfaces/IQuery";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import getLogger from "../utils/logger";
import MembershipModel from "../models/MembershipPackageModel";
import ChildModel from "../models/ChildModel";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";

export interface IDoctor extends IUser {
  rating?: number;
}

export type returnData = {
  users: IDoctor[];
  page: number;
  total: number;
  totalPages: number;
};
class UserRepository implements IUserRepository {
  /**
   * Creates a new user document in the database.
   * @param data - Object containing user data.
   * @param session - Optional MongoDB client session for transactional operations.
   * @returns The created user document.
   * @throws Error when the creation fails.
   */
  async createUser(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUser> {
    try {
      const user = await UserModel.create([{ ...data }], { session });
      return user[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to  creating user: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by its ID.
   * @param userId - The ID of the user to retrieve.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserById(
    userId: string,
    ignoreDeleted: boolean
  ): Promise<IUser | null> {
    try {
      type searchQuery = {
        _id: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };
      const searchQuery: searchQuery = {
        _id: new mongoose.Types.ObjectId(userId),
      };
      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }
      const user = await UserModel.findOne(searchQuery);
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by email.
   * @param email - The email address to search for.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email: { $eq: email } });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by email: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by email.
   * @param email - The email address to search for.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getGoogleUser(email: string, googleId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({
        $or: [{ email: { $eq: email } }, { googleId: { $eq: googleId } }],
      });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by email: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by phone number.
   * @param phoneNumber - The phone number to search for.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ phoneNumber });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to finding user by phone number: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Marks a user document as deleted by setting `isDeleted` to true.
   * @param userId - The ID of the user to delete.
   * @returns True if the operation is successful.
   * @throws Error when the update fails.
   */
  async deleteUserById(
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        { isDeleted: true },
        { session, new: true }
      );
      return true;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to deleting a user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Updates a user document by its ID with partial data.
   * @param userId - The ID of the user to update.
   * @param data - Partial user data to update.
   * @returns The updated user document or null if not found.
   * @throws Error when the update fails.
   */
  async updateUserById(
    userId: string,
    data: Partial<IUser>,
    session?: mongoose.ClientSession
  ): Promise<IUser | null> {
    try {
      data = {
        ...data,
        updatedAt: new Date(),
      };

      const user = await UserModel.findByIdAndUpdate(userId, data, {
        session,
        new: true,
      });

      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to updating user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches a user document by its ID (alternative implementation).
   * @param userId - The ID o f the user to retrieve.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserByIdRepository(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });
      return user;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed togetting a user by id: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  /**
   * Fetches all users with pagination, sorting, and filtering.
   * @param query - Query object containing pagination and search parameters.
   * @returns An object containing users, pagination metadata, and total counts.
   * @throws Error when the query fails.
   */

  async getAllUsersRepository(
    query: IQuery,
    ignoreDeleted: boolean,
    role?: number | Array<number>
  ): Promise<returnData> {
    type SearchQuery = {
      isDeleted?: boolean;
      role?: number | { $in: Array<number> };
      $or?: Array<{ name?: { $regex: string; $options: string } } | { email?: { $regex: string; $options: string } }>;
    };    
    try {
      const { page, size, search, order = "descending", sortBy = "date" } = query;
      const searchQuery: SearchQuery = {};

      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      if (search) {
        searchQuery.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (role !== undefined && role !== null) {
        const parsedRole = Array.isArray(role)
          ? role.map(Number)
          : Number(role);
      
        if (typeof parsedRole === "number" && !isNaN(parsedRole)) {
          searchQuery.role = parsedRole;
        } else if (Array.isArray(parsedRole) && parsedRole.length > 0) {
          searchQuery.role = { $in: parsedRole };
        }
      }          

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";
      if (sortBy === "name") sortField = "name";

      const skip = (page - 1) * size;
      const users = await UserModel.aggregate([
        { $match: searchQuery },
        { $skip: skip },
        { $limit: size },
        {
          $sort: { [sortField]: sortOrder },
        },
        {
          $lookup: {
            from: "membershippackages", // The name of the collection in MongoDB
            localField: "subscription.currentPlan",
            foreignField: "_id",
            as: "subscription.currentPlan",
          },
        },
        {
          $lookup: {
            from: "membershippackages",
            localField: "subscription.futurePlan",
            foreignField: "_id",
            as: "subscription.futurePlan",
          },
        },
        {
          $unwind: {
            path: "$subscription.currentPlan",
            preserveNullAndEmptyArrays: true, // Allow null values if no match
          },
        },
        {
          $unwind: {
            path: "$subscription.futurePlan",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            avatar: 1,
            googleId: 1,
            phoneNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            role: 1,
            "subscription.startDate": 1,
            "subscription.endDate": 1,
            "subscription.viewChart": 1,
            "subscription.currentPlan": 1,
            "subscription.futurePlan": 1,
          },
        },
      ]);

      if (sortBy === "name") {
        users.sort((a, b) => sortOrder * a.name.localeCompare(b.name));
      }

      const totalUsers = await UserModel.countDocuments(searchQuery);

      return {
        users,
        page,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      };
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to getting all users: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async createAdmin(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUser> {
    try {
      const admin = await UserModel.create(
        [
          {
            ...data,
          },
        ],
        { session }
      );
      return admin[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create an admin: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async createDoctor(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IUser> {
    try {
      const doctor = await UserModel.create(
        [
          {
            ...data,
          },
        ],
        { session }
      );
      return doctor[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create a doctor: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async checkExpiration() {
    try {
      const users = await UserModel.aggregate([
        {
          $match: {
            "subscription.endDate": { $lt: new Date() },
            isDeleted: false,
          },
        },
      ]);
      return users;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to check expiration: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async handleExpirations(userIds: Array<IUser>) {
    try {
      const Logger = getLogger("MEMBERSHIP_EXPIRATION");

      for (const userId of userIds) {
        const user = await UserModel.findOne({ _id: userId, isDeleted: false });

        if (!user) {
          Logger.error(`User with userId: ${userId} not found`);
          continue;
        }

        const nextMembershipId = user.subscription.futurePlan;

        if (!nextMembershipId) {
          // No future memberships, clear subscription
          await UserModel.updateOne(
            { _id: userId },
            {
              $set: {
                "subscription.endDate": null,
                "subscription.startDate": null,
                "subscription.currentPlan": null,
              },
            }
          );
          continue;
        }

        const membershipPackage = await MembershipModel.findById(
          nextMembershipId
        );

        if (!membershipPackage) {
          Logger.error(
            `Membership package ${nextMembershipId} not found for user: ${userId}`
          );
          continue;
        }

        const newEndDate = new Date(
          Date.now() +
            3600 * 24 * (membershipPackage.duration.value as number) * 1000
        );

        // const children = await this.getUserChildrenIds(userId.toString());
        // Update user's subscription and remove the used membership from futurePlan
        await UserModel.findByIdAndUpdate(userId, {
          $set: {
            "subscription.currentPlan": nextMembershipId,
            "subscription.startDate": new Date(),
            "subscription.endDate": newEndDate,
            "subscription.futurePlan": null,
            // childrenIds: children,
          },
        });
      }
    } catch (error) {
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Failed to handle expirations: ${(error as Error).message}`
      );
    }
  }

  async getUserChildrenIds(userId: string): Promise<[Types.ObjectId]> {
    try {
      const user = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const childrens = await ChildModel.aggregate([
        {
          $match: {
            relationships: {
              $elemMatch: { memberId: new mongoose.Types.ObjectId(userId) },
            },
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
        { $sort: { ["createdAt"]: 1 } },
      ]);

      return childrens as [Types.ObjectId];
    } catch (error) {
      if (error as CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        `Error update user childrenIds: ${(error as Error).message}`
      );
    }
  }
}

export default UserRepository;
