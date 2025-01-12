import mongoose, { Document } from "mongoose";
import UserModel from "../models/UserModel";
import { IUser } from "../interfaces/IUser";
import { IQuery } from "../interfaces/IQuery";

class UserRepository {
  /**
   * Creates a new user document in the database.
   * @param data - Object containing user data.
   * @param session - Optional MongoDB client session for transactional operations.
   * @returns The created user document.
   * @throws Error when the creation fails.
   */
  async createUser(
    data: Object,
    session?: mongoose.ClientSession
  ): Promise<IUser> {
    try {
      const user = await UserModel.create([{ ...data }], { session });
      return user[0];
    } catch (error: any) {
      throw new Error(`Error when creating user: ${error.message}`);
    }
  }

  /**
   * Fetches a user document by its ID.
   * @param userId - The ID of the user to retrieve.
   * @returns The user document or null if not found.
   * @throws Error when the query fails.
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      });
      return user;
    } catch (error: any) {
      throw new Error(`Error when finding user by id: ${error.message}`);
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
    } catch (error: any) {
      throw new Error(`Error when finding user by email: ${error.message}`);
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
    } catch (error: any) {
      throw new Error(
        `Error when finding user by phone number: ${error.message}`
      );
    }
  }

  /**
   * Marks a user document as deleted by setting `isDeleted` to true.
   * @param userId - The ID of the user to delete.
   * @returns True if the operation is successful.
   * @throws Error when the update fails.
   */
  async deleteUserById(userId: string): Promise<boolean> {
    try {
      await UserModel.findByIdAndUpdate(userId, { isDeleted: true });
      return true;
    } catch (error: any) {
      throw new Error(`Error when deleting a user by id: ${error.message}`);
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

      const user = await UserModel.findByIdAndUpdate(userId, data, { session });

      return user;
    } catch (error: any) {
      throw new Error(`Error when updating user by id: ${error.message}`);
    }
  }

  /**
   * Fetches a user document by its ID (alternative implementation).
   * @param userId - The ID of the user to retrieve.
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
    } catch (error: any) {
      throw new Error(`Error when getting a user by id: ${error.message}`);
    }
  }

  /**
   * Fetches all users with pagination, sorting, and filtering.
   * @param query - Query object containing pagination and search parameters.
   * @returns An object containing users, pagination metadata, and total counts.
   * @throws Error when the query fails.
   */
  async getAllUsersRepository(query: IQuery) {
    try {
      let { page, size, search, order, sortBy } = query;
      const searchQuery: { [key: string]: any } = {
        isDeleted: false,
      };

      if (search) {
        searchQuery.name = { $regex: search, $options: "i" };
      }

      let sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      if (sortBy === "date") sortField = "createdAt";

      const skip = (page - 1) * size;
      const users = await UserModel.aggregate([
        { $match: searchQuery },
        {
          $skip: skip,
        },
        {
          $limit: size,
        },
        {
          $project: {
            email: 1,
            fullName: 1,
            avatar: 1,
            phoneNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            role: 1,
            lastLogin: 1,
          },
        },
        { $sort: { [sortField]: sortOrder } },
      ]);

      const totalUsers = await UserModel.countDocuments(searchQuery);

      return {
        users,
        page,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / size),
      };
    } catch (error: any) {
      throw new Error(`Error when getting all users: ${error.message}`);
    }
  }
}

export default UserRepository;
