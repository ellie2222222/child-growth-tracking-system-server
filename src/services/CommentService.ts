import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
// import CommentRepository from "../repositories/CommentRepository";
import Database from "../utils/database";
// import PostRepository from "../repositories/PostRepository";
import { ObjectId } from "mongoose";
// import UserRepository from "../repositories/UserRepository";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/IQuery";
import { IComment } from "../interfaces/IComment";
import { ICommentService } from "../interfaces/services/ICommentService";
import { ICommentRepository } from "../interfaces/repositories/ICommentRepository";
import { IPostRepository } from "../interfaces/repositories/IPostRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";

class CommentService implements ICommentService {
  private commentRepository: ICommentRepository;
  private postRepository: IPostRepository;
  private userRepository: IUserRepository;
  private database: Database;

  constructor(
    commentRepository: ICommentRepository,
    postRepository: IPostRepository,
    userRepository: IUserRepository
  ) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
    this.userRepository = userRepository;
    this.database = Database.getInstance();
  }

  createComment = async (
    postId: string,
    userId: string,
    content: string
  ): Promise<IComment> => {
    const session = await this.database.startTransaction();
    try {
      const ignoreDeleted = false;
      const checkPost = await this.postRepository.getPost(
        postId,
        ignoreDeleted
      );
      if (!checkPost) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Post not found"
        );
      }

      const comment = await this.commentRepository.createComment(
        {
          postId,
          userId,
          content,
        },
        session
      );

      await this.database.commitTransaction(session);

      return comment;
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

  getComment = async (
    commentId: string | ObjectId,
    requesterId: string
  ): Promise<IComment> => {
    try {
      let ignoreDeleted = false;

      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if ([UserEnum.ADMIN].includes(checkRequester.role)) {
        ignoreDeleted = true;
      }

      const comment = await this.commentRepository.getComment(
        commentId,
        ignoreDeleted
      );

      const checkPost = await this.postRepository.getPost(
        comment.postId,
        ignoreDeleted
      );
      if (!checkPost) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "The post for this comment is not found"
        );
      }

      return comment;
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
  getCommentsByPostId = async (
    postId: string | ObjectId,
    query: IQuery,
    requesterId: string
  ): Promise<{
    comments: IComment[];
    page: number;
    total: number;
    totalPages: number;
  }> => {
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

      if ([UserEnum.ADMIN].includes(checkRequester.role)) {
        ignoreDeleted = true;
      }

      const checkPost = await this.postRepository.getPost(
        postId as string,
        ignoreDeleted
      );
      if (!checkPost) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Post not found"
        );
      }

      const comments = await this.commentRepository.getCommentsByPostId(
        postId,
        query,
        ignoreDeleted
      );
      return comments;
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

  updateComment = async (
    id: string | ObjectId,
    content: string,
    requesterId: string
  ): Promise<IComment> => {
    const session = await this.database.startTransaction();
    try {
      const ignoreDeleted = false;

      const oldComment = await this.commentRepository.getComment(
        id,
        ignoreDeleted
      );

      if (!oldComment) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Comment not found"
        );
      }

      if (oldComment?.userId.toString() !== requesterId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not the owner of this comment"
        );
      }

      const comment = await this.commentRepository.updateComment(
        id,
        {
          content,
        },
        session
      );
      await this.database.commitTransaction(session);
      return comment;
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

  deleteComment = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<boolean> => {
    const session = await this.database.startTransaction();
    try {
      const ignoreDeleted = false;
      const comment = await this.commentRepository.getComment(
        id,
        ignoreDeleted
      );
      if (!comment) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Comment not found"
        );
      }
      if (comment.userId.toString() !== requesterId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not the owner of this comment"
        );
      }
      await this.commentRepository.deleteComment(id, session);
      await this.database.commitTransaction(session);
      return true;
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
}

export default CommentService;
