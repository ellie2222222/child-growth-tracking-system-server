import { ObjectId } from "mongoose";
import PostRepository from "../repositories/PostRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import { cleanUpOldAttachments } from "../utils/filePathFormater";

class PostService {
  private postRepository: PostRepository;
  private database: Database;
  constructor() {
    this.postRepository = new PostRepository();
    this.database = Database.getInstance();
  }
  createPost = async (
    userId: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>
  ) => {
    const session = await this.database.startTransaction();
    try {
      const post = await this.postRepository.createPost(
        {
          userId,
          title,
          content,
          attachments,
        },
        session
      );
      await this.database.commitTransaction();
      return post;
    } catch (error) {
      await this.database.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
  getPost = async (id: string | ObjectId) => {
    try {
      const post = await this.postRepository.getPost(id);
      return post;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getPosts = async (query: IQuery) => {
    try {
      const posts = await this.postRepository.getPosts(query);
      return posts;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  updatePosts = async (
    id: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldPost = await this.postRepository.getPost(id);
      const post = await this.postRepository.updatePost(
        id,
        {
          title,
          content,
          attachments,
        },
        session
      );
      await this.database.commitTransaction();
      cleanUpOldAttachments(oldPost.attachments);
      return post;
    } catch (error) {
      await this.database.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
  deletePost = async (id: string | ObjectId) => {
    const session = await this.database.startTransaction();
    try {
      const post = await this.postRepository.deletePost(id, session);
      await this.database.commitTransaction();
      return post;
    } catch (error) {
      await this.database.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default PostService;
