import mongoose, { ObjectId } from "mongoose";
import { IConsultation } from "../IConsultation";
import { IUser } from "../IUser";
import { IDoctor, returnData } from "../../repositories/UserRepository";
import CustomException from "../../exceptions/CustomException";
import { IQuery } from "../IQuery";

export interface IUserService {
  createUser: (
    name: string,
    password: string,
    phoneNumber: string,
    email: string,
    role: number,
    requesterId: string
  ) => Promise<IUser>;

  getUserById: (
    id: string | ObjectId,
    requesterId: string | ObjectId
  ) => Promise<IDoctor | IUser | CustomException>;

  getUsers: (
    Query: IQuery,
    requesterId: string | ObjectId
  ) => Promise<returnData>;

  updateUser: (
    id: string | ObjectId,
    requesterId: string | ObjectId,
    name?: string,
    role?: number,
    phoneNumber?: string,
    avatar?: string
  ) => Promise<IUser | null>;

  deleteUser: (
    id: string | ObjectId,
    requesterId: string | ObjectId
  ) => Promise<boolean>;

  updateSubscription: (
    id: string | ObjectId,
    membershipPackageId: string | mongoose.Types.ObjectId
  ) => Promise<IUser | null>;

  removeCurrentSubscription: (
    userId: string | ObjectId,
    requesterId: string
  ) => Promise<IUser | null>;

  createConsultationRating: (
    consultationId: string,
    requesterId: string,
    rating: number
  ) => Promise<IConsultation>;

  updateConsultationRating: (
    consultationId: string,
    requesterId: string,
    rating: number
  ) => Promise<IConsultation>;

  removeConsultationRating: (
    consultationId: string,
    requesterId: string,
    rating: number
  ) => Promise<IConsultation>;

  downloadChart: (userId: string) => Promise<void>;
}
