import { ReturnDataConsultationMessages } from "../../repositories/ConsultationMessageRepository";
import { IConsultationMessage } from "../models/IConsultationMessage";
import { IQuery } from "../models/IQuery";

export interface IConsultationMessageService {
  createConsultationMessage: (
    consultationId: string,
    requesterId: string,
    message: string,
    attachments: [string]
  ) => Promise<IConsultationMessage>;

  getConsultationMessage: (
    id: string,
    requesterId: string
  ) => Promise<IConsultationMessage>;

  getConsultationMessages: (
    consultationId: string,
    query: IQuery,
    requesterId: string
  ) => Promise<ReturnDataConsultationMessages>;

  updateConsultationMessage: (
    id: string,
    requesterId: string,
    message: string,
    attachments: [string]
  ) => Promise<IConsultationMessage>;

  deleteConsultationMessage: (id: string, requesterId: string) => Promise<void>;
}
