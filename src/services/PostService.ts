import { ObjectId } from "mongoose";
import PostRepository from "../repositories/PostRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import {
  cleanUpFile,
  cleanUpFileArray,
  extractAndReplaceImages,
} from "../utils/fileUtils";
import UserRepository from "../repositories/UserRepository";
import UserEnum from "../enums/UserEnum";
import TierRepository from "../repositories/TierRepository";
class PostService {
  private postRepository: PostRepository;
  private database: Database;
  private userRepository: UserRepository;
  private tierRepository: TierRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.database = Database.getInstance();
    this.userRepository = new UserRepository();
    this.tierRepository = new TierRepository();
  }
  createPost = async (
    userId: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl?: string
  ) => {
    const session = await this.database.startTransaction();

    try {
      await this.checkTierPostLimit(userId);
      const formatedContent = extractAndReplaceImages(content, attachments);

      const post = await this.postRepository.createPost(
        {
          userId,
          title,
          content: formatedContent,
          attachments,
          thumbnailUrl,
        },
        session
      );

      await this.database.commitTransaction(session);
      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
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
    thumbnailUrl: string,
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
        thumbnailUrl?: string;
      };

      const data: data = {};

      if (title && oldPost.title !== title) {
        data.title = title;
      }
      const formatedContent = extractAndReplaceImages(content, attachments);
      if (content && oldPost.content !== formatedContent) {
        data.content = formatedContent;
      }

      if (attachments && oldPost.attachments !== attachments) {
        data.attachments = attachments;
      }
      if (thumbnailUrl && oldPost.thumbnailUrl !== thumbnailUrl) {
        data.thumbnailUrl = thumbnailUrl;
      }
      const post = await this.postRepository.updatePost(id, data, session);

      await this.database.commitTransaction(session);

      if (oldPost.attachments.length > 0) {
        await cleanUpFileArray(oldPost.attachments, "update");
      }
      if (oldPost.thumbnailUrl !== "") {
        await cleanUpFile(oldPost.thumbnailUrl as string, "update");
      }

      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
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
      await this.database.commitTransaction(session);
      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
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

  checkTierPostLimit = async (userId: string | ObjectId) => {
    try {
      const user = await this.userRepository.getUserById(
        userId as string,
        false
      );

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const tierData = await this.tierRepository.getCurrentTierData(
        user.subscription.tier as number
      );

      const PostsCount = await this.postRepository.countPosts(userId);

      if (PostsCount >= tierData.postsLimit) {
        throw new CustomException(
          StatusCodeEnum.TooManyRequests_429,
          "You have exceeded your current tier post limit"
        );
      }
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
}

export default PostService;
