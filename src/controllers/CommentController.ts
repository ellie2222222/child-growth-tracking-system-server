import { NextFunction, Request, Response } from "express";
import CommentService from "../services/CommentService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class CommentController {
  private commentService: CommentService;
  constructor() {
    this.commentService = new CommentService();
  }
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId, content } = req.body;
      const userId = req.userInfo.userId;
      const comment = await this.commentService.createComment(
        postId,
        userId,
        content
      );
      res
        .status(StatusCodeEnum.Created_201)
        .json({ comment: comment, message: "Comment created successfully" });
    } catch (error) {
      next(error);
    }
  };

  getComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const comment = await this.commentService.getComment(id, requesterId);
      res.status(StatusCodeEnum.OK_200).json({
        comment: comment,
        message: "Get comment successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentsByPostId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId, page, size, search, order, sortBy } = req.query;
      const requesterId = req.userInfo.userId;

      const comments = await this.commentService.getCommentsByPostId(
        postId as string,
        {
          page: page ? parseInt(page as string) : 1,
          size: size ? parseInt(size as string) : 10,
          search: search ? (search as string) : "",
          order: order ? (order as "ascending" | "descending") : "ascending",
          sortBy: sortBy ? (sortBy as "date") : "date",
        },
        requesterId
      );
      res
        .status(StatusCodeEnum.OK_200)
        .json({ ...comments, message: "Get comments by postId successfully" });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const requesterId = req.userInfo.userId;
      const comment = await this.commentService.updateComment(
        id,
        content,
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        comment: comment,
        message: "Update comment successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const comment = await this.commentService.deleteComment(id, requesterId);
      res.status(StatusCodeEnum.OK_200).json({
        comment: comment,
        message: "Delete comment successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CommentController;
