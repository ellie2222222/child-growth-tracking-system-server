import { ObjectId } from "mongoose";
import { IBaseEntity } from "../../models/BaseModel";

export enum PostStatus {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
}

export interface IPost extends IBaseEntity {
  userId: ObjectId;
  title: string;
  content: string;
  thumbnailUrl?: string;
  attachments: Array<string>;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
