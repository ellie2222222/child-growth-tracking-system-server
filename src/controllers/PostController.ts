import { NextFunction, Request, Response } from "express";
import PostService from "../services/PostService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { cleanUpFileArray, formatPathArray } from "../utils/filePathFormater";

class PostController {
  private postService: PostService;
  constructor() {
    this.postService = new PostService();
  }

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content } = req.body;
      const userId = req.userInfo.userId;

      const files = req.files as Express.Multer.File[]; // Explicitly cast req.files to array
      let attachments: string[] = [];
      if (files) {
        attachments = formatPathArray(files) as string[];
      }

      const post = await this.postService.createPost(
        userId,
        title,
        content,
        attachments
      );
      res
        .status(StatusCodeEnum.Created_201)
        .json({ Post: post, message: "Post created successfully" });
    } catch (error) {
      if (req.files as Express.Multer.File[]) {
        await cleanUpFileArray(req.files as Express.Multer.File[]);
      }
      next(error);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postService.getPost(id);
      res.status(StatusCodeEnum.OK_200).json({
        Post: post,
        message: "Get post successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy } = req.query;
      const posts = await this.postService.getPosts({
        page: parseInt(page as string) || 1,
        size: parseInt(size as string) || 10,
        search: search as string,
        order: (order as "ascending" | "descending") || "ascending",
        sortBy: (sortBy as "date") || "date",
      });
      res.status(StatusCodeEnum.OK_200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  updatePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const files = req.files as Express.Multer.File[]; // Explicitly cast req.files to array
      let attachments: string[] = [];
      if (files) {
        attachments = formatPathArray(files) as string[];
      }
      const post = await this.postService.updatePosts(
        id,
        title,
        content,
        attachments
      );
      res
        .status(StatusCodeEnum.OK_200)
        .json({ Post: post, message: "Post updated successfully" });
    } catch (error) {
      if (req.files as Express.Multer.File[]) {
        await cleanUpFileArray(req.files as Express.Multer.File[]);
      }
      next(error);
    }
  };
  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.postService.deletePost(id);
      res
        .status(StatusCodeEnum.OK_200)
        .json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
export default PostController;
