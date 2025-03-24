import mongoose, { ClientSession, ObjectId } from "mongoose";
import { IQuery } from "../IQuery";
import { IConsultation } from "../IConsultation";
import { returnDataConsultation } from "../../repositories/ConsultationRepository";

export interface IConsultationRepository {
  createConsultation(
    data: object,
    session?: ClientSession
  ): Promise<IConsultation>;

  getConsultations(
    query: IQuery,
    ignoreDeleted: boolean,
    status: string
  ): Promise<returnDataConsultation>;

  getConsultation(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IConsultation | null>;

  updateConsultation(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IConsultation>;

  getConsultationsByUserId(
    query: IQuery,
    ignoreDeleted: boolean,
    userId: string,
    status?: string,
    as?: "MEMBER" | "DOCTOR"
  ): Promise<returnDataConsultation>;

  deleteConsultation(
    id: string,
    session?: mongoose.ClientSession
  ): Promise<IConsultation>;

  getAllConsultationsByDoctorId(userId: string): Promise<IConsultation[]>;
}
