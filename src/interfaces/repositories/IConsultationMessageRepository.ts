import { ClientSession, ObjectId } from "mongoose";
import { IQuery } from "../IQuery";
import { IConsultationMessage } from "../IConsultationMessage";
import { ReturnDataConsultationMessages } from "../../repositories/ConsultationMessageRepository";

export interface IConsultationMessageRepository {
  createConsultationMessage(
    data: object,
    session?: ClientSession
  ): Promise<IConsultationMessage>;

  getConsultationMessages(
    consultationId: string | ObjectId,
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<ReturnDataConsultationMessages>;

  getConsultationMessage(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IConsultationMessage | null>;

  updateConsultationMessage(
    id: string,
    data: object,
    session?: ClientSession
  ): Promise<IConsultationMessage>;
}
