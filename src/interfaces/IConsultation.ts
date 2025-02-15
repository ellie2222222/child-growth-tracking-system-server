import { IBaseEntity } from "../models/BaseModel";
import { ObjectId } from "mongoose";

export enum ConsultationStatus {
  OnGoing = "OnGoing",
  Ended = "Ended",
}
export interface IConsultation extends IBaseEntity {
  requestId: ObjectId;
  status: ConsultationStatus;
  userFeedback: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
