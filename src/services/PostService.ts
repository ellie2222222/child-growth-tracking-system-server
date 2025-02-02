import { ObjectId } from "mongoose";
import PostRepository from "../repositories/PostRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import { cleanUpOldAttachments } from "../utils/filePathFormater";
import UserRepository from "../repositories/UserRepository";
import UserEnum from "../enums/UserEnum";
class PostService {
  private postRepository: PostRepository;
  private database: Database;
  private userRepository: UserRepository;
  constructor() {
    this.postRepository = new PostRepository();
    this.database = Database.getInstance();
    this.userRepository = new UserRepository();
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

      await session.commitTransaction();
      return post;
    } catch (error) {
      await session.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  getPost = async (id: string | ObjectId, requesterId: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }
      const post = await this.postRepository.getPost(id, ignoreDeleted);
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

  getPosts = async (query: IQuery, requesterId: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }
      const posts = await this.postRepository.getPosts(query, ignoreDeleted);
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
    attachments: Array<string>,
    requesterId: string
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldPost = await this.postRepository.getPost(id, true);

      if (requesterId.toString() !== oldPost.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to update this post"
        );
      }

      type data = {
        title?: string;
        content?: string;
        attachments?: Array<string>;
      };

      const data: data = {};

      if (title) {
        data.title = title;
      }

      if (content) {
        data.content = content;
      }

      if (attachments) {
        data.attachments = attachments;
      }
      const post = await this.postRepository.updatePost(id, data, session);

      await session.commitTransaction();

      cleanUpOldAttachments(oldPost.attachments);

      return post;
    } catch (error) {
      await session.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  deletePost = async (id: string | ObjectId, requesterId: string) => {
    const session = await this.database.startTransaction();

    try {
      const oldPost = await this.postRepository.getPost(id, true);
      if (requesterId.toString() !== oldPost.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to update this post"
        );
      }
      const post = await this.postRepository.deletePost(id, session);
      await session.commitTransaction();
      return post;
    } catch (error) {
      await session.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };
}

export default PostService;
