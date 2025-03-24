import { NextFunction, Request, Response } from "express";
// import PostService from "../services/PostService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import {
  cleanUpFile,
  cleanUpFileArray,
  formatPathArray,
  formatPathSingle,
} from "../utils/fileUtils";
import { PostStatus } from "../interfaces/IPost";
import { IPostService } from "../interfaces/services/IPostService";

type BlogFiles = {
  postAttachments: Express.Multer.File[];
  postThumbnail: Express.Multer.File[];
};

class PostController {
  private postService: IPostService;
  constructor(postService: IPostService) {
    this.postService = postService;
  }

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };

    let hasThumbnail: boolean = false;
    hasThumbnail = (files &&
      files.postThumbnail &&
      files.postThumbnail.length > 0) as boolean;

    let hasAttachments: boolean = false;
    hasAttachments = (req.files &&
      files.postAttachments &&
      files.postAttachments.length > 0) as boolean;

    try {
      const { title, content } = req.body;
      const userId = req.userInfo.userId;
      const files = req.files as unknown as BlogFiles;

      let attachments: string[] = [];
      let thumbnailUrl: string = "";

      if (hasAttachments) {
        attachments = formatPathArray(
          files.postAttachments as Express.Multer.File[]
        ) as string[];
      }

      if (hasThumbnail) {
        thumbnailUrl = formatPathSingle(
          files.postThumbnail[0] as Express.Multer.File
        ) as string;
      }

      const post = await this.postService.createPost(
        userId,
        title,
        content,
        attachments,
        thumbnailUrl
      );

      res
        .status(StatusCodeEnum.Created_201)
        .json({ post: post, message: "Post created successfully" });
    } catch (error) {
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      if (hasThumbnail) {
        const thumbnail = (files.postThumbnail || [])[0];

        await cleanUpFile(thumbnail, "create");
      }

      if (hasAttachments) {
        const attachments = files.postAttachments || [];
        await cleanUpFileArray(attachments, "create");
      }

      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId || "";
      const post = await this.postService.getPost(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        post: post,
        message: "Get post successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy, status } = req.query;
      const requesterId = req.userInfo.userId;
      const posts = await this.postService.getPosts(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        requesterId,
        status as string
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ ...posts, message: "Get posts successfully" });
    } catch (error) {
      next(error);
    }
  };

  getPostsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterId = req.userInfo.userId;
      const { id } = req.params;
      const { page, size, search, order, sortBy } = req.query;

      console.log(id);
      const posts = await this.postService.getPostsByUserId(
        requesterId,
        id as string,
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        }
      );

      res.status(StatusCodeEnum.OK_200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };

    let hasThumbnail: boolean = false;
    hasThumbnail = (files &&
      files.postThumbnail &&
      files.postThumbnail.length > 0) as boolean;

    let hasAttachments: boolean = false;
    hasAttachments = (files &&
      files.postAttachments &&
      files.postAttachments.length > 0) as boolean;
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const requesterId = req.userInfo.userId;
      const files = req.files as unknown as BlogFiles;

      let attachments: string[] = [];
      let thumbnailUrl: string = "";

      if (hasAttachments) {
        attachments = formatPathArray(
          files.postAttachments as Express.Multer.File[]
        ) as string[];
      }

      if (hasThumbnail) {
        thumbnailUrl = formatPathSingle(
          files.postThumbnail[0] as Express.Multer.File
        ) as string;
      }

      const post = await this.postService.updatePost(
        id,
        title,
        content,
        attachments,
        thumbnailUrl,
        requesterId
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ post: post, message: "Post updated successfully" });
    } catch (error) {
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      if (hasThumbnail) {
        const thumbnail = (files.postThumbnail || [])[0];

        await cleanUpFile(thumbnail, "create");
      }

      if (hasAttachments) {
        const attachments = files.postAttachments || [];

        await cleanUpFileArray(attachments, "create");
      }

      next(error);
    }
  };

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      await this.postService.deletePost(id, requesterId);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  updatePostStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const requesterId = req.userInfo.userId;
      const post = await this.postService.updatePostStatus(
        id,
        status as PostStatus,
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json({
        post: post,
        message: `Updated post status successfully to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PostController;
