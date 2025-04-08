import { ObjectId } from "mongoose";
import { IComment } from "../models/IComment";
import { IQuery } from "../models/IQuery";

export interface ICommentService {
  createComment: (
    postId: string,
    userId: string,
    content: string
  ) => Promise<IComment>;

  getComment: (
    commentId: string | ObjectId,
    requesterId: string
  ) => Promise<IComment>;

  getCommentsByPostId: (
    postId: string | ObjectId,
    query: IQuery,
    requesterId: string
  ) => Promise<{
    comments: IComment[];
    page: number;
    total: number;
    totalPages: number;
  }>;

  updateComment: (
    id: string | ObjectId,
    content: string,
    requesterId: string
  ) => Promise<IComment>;
  deleteComment: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<boolean>;
}
