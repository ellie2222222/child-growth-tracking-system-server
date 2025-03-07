import mongoose, { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import PostModel from "../models/PostModel";
import { IQuery } from "../interfaces/IQuery";
import { IPost, PostStatus } from "../interfaces/IPost";
import { IPostRepository } from "../interfaces/repositories/IPostRepository";

class PostRepository implements IPostRepository {
  constructor() {}
  async createPost(
    data: object,
    session?: mongoose.ClientSession
  ): Promise<IPost> {
    try {
      const post = await PostModel.create([data], { session });
      return post[0];
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

  async getPost(id: ObjectId | string, ignoreDeleted: boolean): Promise<IPost> {
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

  async getPosts(
    query: IQuery,
    ignoreDeleted: boolean,
    status: string
  ): Promise<object> {
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
        posts: Posts,
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
  ): Promise<IPost> {
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

  async deletePost(
    id: string | ObjectId,
    session?: mongoose.ClientSession
  ): Promise<IPost> {
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

  async countPosts(
    userId: string | ObjectId,
    start: Date,
    end: Date
  ): Promise<number> {
    try {
      const count = await PostModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId as string),
        createdAt: { $gte: start, $lte: end },
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

  async getPostByTitle(title: string): Promise<IPost | null> {
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

  async getPostsByUserId(
    id: string,
    query: IQuery,
    status: string
  ): Promise<object> {
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
