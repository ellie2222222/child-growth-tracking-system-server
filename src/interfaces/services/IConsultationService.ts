import { ObjectId } from "mongoose";
import { returnDataConsultation } from "../../repositories/ConsultationRepository";
import { IQuery } from "../IQuery";
import { IConsultation } from "../IConsultation";

export interface IConsultationService {
  updateConsultationStatus: (
    id: string,
    status: string,
    requesterId: string,
    cronJob?: boolean
  ) => Promise<IConsultation>;
  getConsultation: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<IConsultation>;

  getConsultations: (
    query: IQuery,
    status: string,
    requesterId: string
  ) => Promise<returnDataConsultation>;
  getConsultationsByUserId: (
    query: IQuery,
    status: string,
    userId: string | ObjectId,
    requesterId: string,
    as: "MEMBER" | "DOCTOR"
  ) => Promise<returnDataConsultation>;

  deleteConsultation: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<IConsultation>;
}
