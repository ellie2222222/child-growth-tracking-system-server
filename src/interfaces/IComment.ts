import { ObjectId } from "mongoose";
import { IBaseEntity } from "../models/BaseModel";

export interface IComment extends IBaseEntity {
  userId: ObjectId;
  postId: ObjectId;
  content: string;
}
