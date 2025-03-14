import mongoose, { ClientSession, ObjectId } from "mongoose";
import { IComment } from "../IComment";
import { IQuery } from "../IQuery";

export interface ICommentRepository {
  createComment(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IComment>;

  getComment(id: string | ObjectId, ignoreDeleted: boolean): Promise<IComment>;

  getCommentsByPostId(
    postId: string | ObjectId,
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<{
    comments: IComment[];
    page: number;
    total: number;
    totalPages: number;
  }>;

  updateComment(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IComment>;

  deleteComment(
    id: string | ObjectId,
    session?: mongoose.ClientSession
  ): Promise<IComment | null>;
}
