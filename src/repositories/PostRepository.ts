import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import PostModel from "../models/PostModel";
import { IQuery } from "../interfaces/IQuery";

class PostRepository {
  constructor() {}
  async createPost(data: object, session?: mongoose.ClientSession) {
    try {
      const post = await PostModel.create([data], { session });
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
  }

  async getPost(id: ObjectId | string) {
    try {
      const post = await PostModel.findOne({
        _id: new mongoose.Types.ObjectId(id as string),
        isDeleted: false,
      });

      if (!post) {
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
  }

  async getPosts(query: IQuery) {
    const { page, size, search, order, sortBy } = query;
    type searchQuery = {
      isDeleted: false;
      title?: { $regex: string; $options: string };
    };

    try {
      const searchQuery: searchQuery = { isDeleted: false };
      if (search && search !== "") {
        searchQuery.title = { $regex: search, $options: "i" };
      }
      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;
      const skip = (page - 1) * size;

      const Posts = await PostModel.aggregate([
        {
          $match: searchQuery,
        },
        { $skip: skip },
        { $limit: size },
        { $sort: { [sortField]: sortOrder } },
      ]);
      const totalPost = await PostModel.countDocuments(searchQuery);

      return {
        Posts,
        page,
        totalPost,
        totalPage: Math.ceil(totalPost / size),
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

  async updatePost(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ) {
    try {
      const post = await PostModel.findByIdAndUpdate(id, data, { session });

      if (!post) {
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
  }

  async deletePost(id: string | ObjectId, session?: mongoose.ClientSession) {
    try {
      const post = await PostModel.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { session }
      );

      if (!post) {
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
  }
}
export default PostRepository;
