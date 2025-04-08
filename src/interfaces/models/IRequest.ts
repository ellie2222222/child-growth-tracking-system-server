import { ObjectId } from "mongoose";
import { IBaseEntity } from "../../models/BaseModel";

export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export interface IRequest extends IBaseEntity {
  memberId: ObjectId;
  childIds: [ObjectId];
  doctorId: ObjectId;
  status: RequestStatus;
  title: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
