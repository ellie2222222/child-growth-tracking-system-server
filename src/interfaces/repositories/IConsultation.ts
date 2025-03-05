import mongoose, { ClientSession, ObjectId } from "mongoose";
import { IQuery } from "../IQuery";
import { IConsultation } from "../IConsultation";

export interface IConsultationRepository {
  createConsultation(data: object, session?: ClientSession): Promise<IConsultation>;

  getConsultations(
    query: IQuery,
    ignoreDeleted: boolean,
    status: string
  ): Promise<object>;

  getConsultation(id: string | ObjectId, ignoreDeleted: boolean): Promise<IConsultation | null>;

  updateConsultation(
    id: string ,
    data: object,
    session?: ClientSession
  ): Promise<IConsultation>;

  getConsultationsByUserId(
    query: IQuery,
    ignoreDeleted: boolean,
    userId: string,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ): Promise<object>;
}
