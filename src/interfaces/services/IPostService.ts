import { ObjectId } from "mongoose";
import { IPost, PostStatus } from "../IPost";
import { ReturnDataPosts } from "../../repositories/PostRepository";
import { IQuery } from "../IQuery";

export interface IPostService {
  createPost: (
    userId: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl?: string
  ) => Promise<IPost>;

  getPost: (id: string | ObjectId, requesterId: string) => Promise<IPost>;

  getPosts: (
    query: IQuery,
    requesterId: string,
    status: string
  ) => Promise<ReturnDataPosts>;

  updatePost: (
    id: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl: string,
    requesterId: string
  ) => Promise<IPost | null>;

  updatePostStatus: (
    id: string | ObjectId,
    status: PostStatus,
    requesterId: string
  ) => Promise<IPost | null>;

  deletePost: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<IPost | null>;
  getPostsByUserId: (
    requesterId: string,
    userId: string,
    query: IQuery
  ) => Promise<ReturnDataPosts>;
}
