import { ObjectId } from "mongoose";
import { IBaseEntity } from "../models/BaseModel";

export interface IPost extends IBaseEntity {
  userId: ObjectId;
  title: string;
  content: string;
  attachments: Array<string>;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
