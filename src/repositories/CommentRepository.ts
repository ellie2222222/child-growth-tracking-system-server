import mongoose, { ClientSession, ObjectId } from "mongoose";
import CommentModel from "../models/CommentModel";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";

class CommentRepository {
  async createComment(data: object, session?: mongoose.ClientSession) {
    try {
      const comment = await CommentModel.create([data], { session });
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

  async getComment(id: string | ObjectId, ignoreDeleted: boolean) {
    try {
      type searchQuery = {
        _id: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };
      const searchQuery: searchQuery = {
        _id: new mongoose.Types.ObjectId(id as string),
      };

      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }
      // console.log(searchQuery);

      const comment = await CommentModel.findOne(searchQuery);

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

  async getCommentsByPostId(
    postId: string | ObjectId,
    query: IQuery,
    ignoreDeleted: boolean
  ) {
    try {
      type searchQuery = {
        postId: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };
      const searchQuery: searchQuery = {
        postId: new mongoose.Types.ObjectId(postId as string),
      };
      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }
      // console.log(searchQuery);

      const comments = await CommentModel.aggregate([
        {
          $match: searchQuery,
        },
        { $skip: (query.page - 1) * query.size },
        { $limit: query.size },
      ]);
      if (comments.length === 0) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No comment found for this post"
        );
      }
      const totalComment = await CommentModel.countDocuments(searchQuery);
      return {
        comments,
        page: query.page || 1,
        total: totalComment,
        totalPages: Math.ceil(totalComment / query.size),
      };
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
