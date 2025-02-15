import { IBaseEntity } from "../models/BaseModel";
import { ObjectId } from "mongoose";

export interface IConsultationMessage extends IBaseEntity {
  sender: ObjectId;
  consultationId: ObjectId;
  message: string;
  attachements: Array<string>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
