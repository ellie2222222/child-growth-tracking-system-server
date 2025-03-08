import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import CommentRepository from "../repositories/CommentRepository";
import Database from "../utils/database";
import PostRepository from "../repositories/PostRepository";
import { ObjectId } from "mongoose";
import UserRepository from "../repositories/UserRepository";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/IQuery";

class CommentService {
  private commentRepository: CommentRepository;
  private database: Database;
  private postRepository: PostRepository;
  private userRepository: UserRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.database = Database.getInstance();
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
  }

  createComment = async (postId: string, userId: string, content: string) => {
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

  getComment = async (commentId: string | ObjectId, requesterId: string) => {
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
  ) => {
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
  ) => {
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

  deleteComment = async (id: string | ObjectId, requesterId: string) => {
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
