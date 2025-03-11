import mongoose, { Types } from "mongoose";
import { IUser } from "../IUser";
import { IQuery } from "../IQuery";
import { returnData } from "../../repositories/UserRepository";

export interface IUserRepository {
  createUser(data: object, session?: mongoose.ClientSession): Promise<IUser>;

  getUserById(userId: string, ignoreDeleted: boolean): Promise<IUser | null>;

  getUserByEmail(email: string): Promise<IUser | null>;

  getGoogleUser(email: string, googleId: string): Promise<IUser | null>;

  getUserByPhoneNumber(phoneNumber: string): Promise<IUser | null>;

  deleteUserById(
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  updateUserById(
    userId: string,
    data: Partial<IUser>,
    session?: mongoose.ClientSession
  ): Promise<IUser | null>;

  getUserByIdRepository(userId: string): Promise<IUser | null>;

  getAllUsersRepository(
    query: IQuery,
    ignoreDeleted: boolean,
    role?: number | Array<number>
  ): Promise<returnData>;

  getUserChildrenIds: (userId: string) => Promise<Types.ObjectId[]>;
}
