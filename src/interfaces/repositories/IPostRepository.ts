import mongoose, { ObjectId } from "mongoose";
import { IQuery } from "../IQuery";
import { IPost } from "../IPost";
import { ReturnDataPosts } from "../../repositories/PostRepository";

export interface IPostRepository {
  createPost(data: object, session?: mongoose.ClientSession): Promise<IPost>;

  getPost(id: ObjectId | string, ignoreDeleted: boolean): Promise<IPost>;

  getPosts(
    query: IQuery,
    ignoreDeleted: boolean,
    status: string
  ): Promise<ReturnDataPosts>;

  updatePost(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IPost | null>;

  deletePost(
    id: string | ObjectId,
    session?: mongoose.ClientSession
  ): Promise<IPost | null>;

  countPosts(
    userId: string | ObjectId,
    start: Date,
    end: Date
  ): Promise<number>;

  getPostByTitle(title: string): Promise<IPost | null>;

  getPostsByUserId(
    id: string,
    query: IQuery,
    status: string
  ): Promise<ReturnDataPosts>;
}
