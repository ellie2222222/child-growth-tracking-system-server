import mongoose, { ClientSession, ObjectId } from "mongoose";
import CommentModel from "../models/CommentModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";

class CommentRepository {
  async createComment(data: object, session?: mongoose.ClientSession) {
    try {
      const comment = await CommentModel.create(data, { session });
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
  }

  async getComment(id: string | ObjectId) {
    try {
      const comment = await CommentModel.findOne({
        _id: new mongoose.Types.ObjectId(id as string),
        isDeleted: false,
      });
      if (!comment) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Comment not found"
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
  }

  async getCommentsByPostId(postId: string | ObjectId, query: IQuery) {
    try {
      const comments = await CommentModel.aggregate([
        {
          $match: {
            postId: new mongoose.Types.ObjectId(postId as string),
            isDeleted: false,
          },
          $skip: (query.page - 1) * query.size,
          $limit: query.size,
        },
      ]);
      if (comments.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No comment found for this post"
        );
      }
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
  }

  async updateComment(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ) {
    try {
      const comment = await CommentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id as string) },
        data,
        { session, new: true }
      );
      if (!comment) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Comment not found"
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
  }
  async deleteComment(id: string | ObjectId, session?: ClientSession) {
    try {
      const comment = await CommentModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id as string),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );
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
  }
}

export default CommentRepository;
