import { ObjectId } from "mongoose";
import { ReturnDataPosts } from "../repositories/PostRepository";
// import PostRepository from "../repositories/PostRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import {
  cleanUpFile,
  cleanUpFileArray,
  extractAndReplaceImages,
} from "../utils/fileUtils";

import UserEnum from "../enums/UserEnum";
import { IPost, PostStatus } from "../interfaces/IPost";
import { IPostService } from "../interfaces/services/IPostService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IPostRepository } from "../interfaces/repositories/IPostRepository";
import { IMembershipPackageRepository } from "../interfaces/repositories/IMembershipPackageRepository";

class PostService implements IPostService {
  private postRepository: IPostRepository;
  private userRepository: IUserRepository;
  private membershipPackageRepository: IMembershipPackageRepository;
  private database: Database;

  constructor(
    postRepository: IPostRepository,
    userRepository: IUserRepository,
    membershipPackageRepository: IMembershipPackageRepository
  ) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
    this.membershipPackageRepository = membershipPackageRepository;
    this.database = Database.getInstance();
  }
  createPost = async (
    userId: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl?: string
  ): Promise<IPost> => {
    const session = await this.database.startTransaction();

    try {
      const checkPost = await this.postRepository.getPostByTitle(title);

      if (checkPost) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Post title already been taken"
        );
      }

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

  getPost = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<IPost> => {
    try {
      let ignoreDeleted = false;
      const checkPost = await this.postRepository.getPost(id, ignoreDeleted);
      let isOwner = false;
      let isAdmin = false;
      if (requesterId && requesterId !== "") {
        const checkRequester = await this.userRepository.getUserById(
          requesterId,
          ignoreDeleted
        );

        if (
          [UserEnum.ADMIN].includes(checkRequester?.role || UserEnum.MEMBER)
        ) {
          ignoreDeleted = true;
          isAdmin = true;
        }

        if (!checkRequester) {
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Requester not found"
          );
        }
        if (checkRequester._id === checkPost.userId) {
          isOwner = true;
        }
      }

      const post = await this.postRepository.getPost(id, ignoreDeleted);

      if ((!isAdmin || !isOwner) && post.status !== PostStatus.PUBLISHED) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Post not found"
        );
      }
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

  getPosts = async (
    query: IQuery,
    requesterId: string,
    status: string
  ): Promise<ReturnDataPosts> => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );

      if ([UserEnum.ADMIN].includes(checkRequester?.role || UserEnum.MEMBER)) {
        ignoreDeleted = true;
      }

      let formatedStatus;
      if (
        [UserEnum.DOCTOR, UserEnum.MEMBER].includes(
          checkRequester?.role || UserEnum.MEMBER
        )
      ) {
        formatedStatus = "PUBLISHED";
      } else {
        formatedStatus = status;
      }
      const posts = await this.postRepository.getPosts(
        query,
        ignoreDeleted,
        formatedStatus
      );
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

  updatePost = async (
    id: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl: string,
    requesterId: string
  ): Promise<IPost | null> => {
    const session = await this.database.startTransaction();
    try {
      const oldPost = await this.postRepository.getPost(id, true);

      if (requesterId.toString() !== oldPost.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to update this post"
        );
      }

      const checkPost = await this.postRepository.getPostByTitle(title);

      if (checkPost) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Post title already been taken"
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

  updatePostStatus = async (
    id: string | ObjectId,
    status: PostStatus,
    requesterId: string
  ): Promise<IPost | null> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(requesterId, false);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkPost = await this.postRepository.getPost(id, false);
      if (
        checkPost.userId.toString() !== requesterId &&
        ![UserEnum.ADMIN].includes(user.role)
      ) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "You do not have access to perform this action"
        );
      }

      const data =
        status === PostStatus.DELETED
          ? { status, isDeleted: true }
          : { status };

      switch (status as PostStatus) {
        case PostStatus.REJECTED:
          // console.log("REJECTED");
          if (![UserEnum.ADMIN].includes(user.role)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Forbidden"
            );
          }
          break;

        case PostStatus.PUBLISHED:
          // console.log("PUBLISHED");
          if (![UserEnum.ADMIN].includes(user.role)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Forbidden"
            );
          }
          break;

        default:
          break;
      }
      const post = await this.postRepository.updatePost(id, data, session);

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

  deletePost = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<IPost | null> => {
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

      await cleanUpFile(oldPost.thumbnailUrl as string, "update");
      await cleanUpFileArray(oldPost.attachments, "update");

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

  getPostsByUserId = async (
    requesterId: string,
    userId: string,
    query: IQuery
  ): Promise<ReturnDataPosts> => {
    try {
      let status;
      if (requesterId !== userId) {
        status = PostStatus.PUBLISHED;
      }

      const posts = await this.postRepository.getPostsByUserId(
        userId,
        query,
        status as string
      );

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
}

export default PostService;
