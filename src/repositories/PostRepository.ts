import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import PostModel from "../models/PostModel";
import { IQuery } from "../interfaces/IQuery";
import { PostStatus } from "../interfaces/IPost";

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

  async getPost(id: ObjectId | string, ignoreDeleted: boolean) {
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
      const post = await PostModel.findOne(searchQuery);

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

  async getPosts(query: IQuery, ignoreDeleted: boolean, status: string) {
    const { page, size, search, order, sortBy } = query;
    type searchQuery = {
      isDeleted?: boolean;
      title?: { $regex: string; $options: string };
      status?: string;
    };

    try {
      const searchQuery: searchQuery = ignoreDeleted
        ? {}
        : { isDeleted: false };
      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      if (search && search !== "") {
        searchQuery.title = { $regex: search, $options: "i" };
      }

      if (status) {
        searchQuery.status = status;
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
      console.log(id);
      const post = await PostModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id as string),
          isDeleted: false,
        },
        data,
        {
          session,
          new: true,
        }
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

  async deletePost(id: string | ObjectId, session?: mongoose.ClientSession) {
    try {
      const post = await PostModel.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, status: PostStatus.DELETED } },
        { session, new: true }
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

  async countPosts(userId: string | ObjectId) {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();

      const firstDay = new Date(year, month, 1); // Local timezone start of the month
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const count = await PostModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId as string),
        createdAt: { $gte: firstDay, $lte: lastDay },
      });

      return count;
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

  async getPostByTitle(title: string) {
    try {
      const post = await PostModel.findOne({
        title: { $eq: title },
        isDeleted: false,
      });
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

  async getPostsByUserId(id: string, query: IQuery, status: string) {
    type searchQuery = {
      userId: mongoose.Types.ObjectId;
      status?: string;
      isDeleted?: boolean;

      title?: string;
    };
    try {
      const searchQuery: searchQuery = {
        userId: new mongoose.Types.ObjectId(id),
      };
      if (status) {
        searchQuery.status = status;
      }

      const { page, size, search, sortBy, order } = query;

      if (search) {
        searchQuery.title = search;
      }

      let sortField = "createdAt";
      if (sortBy === "date") sortField = "createdAt";
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;
      const skip = (page - 1) * size;

      const Posts = await PostModel.aggregate([
        { $match: searchQuery },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
      ]);

      if (!Posts) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "No posts found for this user"
        );
      }

      const totalPosts = await PostModel.countDocuments(searchQuery);
      return {
        Posts,
        page,
        totalPosts,
        totalPage: Math.ceil(totalPosts / size),
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
}
export default PostRepository;
