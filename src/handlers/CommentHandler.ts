import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class CommentHandler {
  constructor() {}
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { postId, content } = req.body;
    const userId = req.userInfo.userId;

    try {
      await validateMongooseObjectId(postId);
    } catch {
      validationErrors.push({ field: "PostId", error: "Invalid postId" });
    }

    try {
      await validateMongooseObjectId(userId);
    } catch {
      validationErrors.push({
        field: "UserId",
        error: "Invalid UserId from token",
      });
    }

    if (!content) {
      validationErrors.push({ field: "Content", error: "Content is required" });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  getComment = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const requesterId = req.userInfo.userId;

    try {
      await validateMongooseObjectId(requesterId);
    } catch {
      validationErrors.push({
        field: "UserId",
        error: "Invalid UserId from token",
      });
    }

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "PostId",
        error: "Invalid PostId",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { postId, page, size, order, sortBy } = req.query;
    const requesterId = req.userInfo.userId;

    try {
      await validateMongooseObjectId(postId as string);
    } catch {
      validationErrors.push({ field: "PostId", error: "Invalid postId" });
    }

    try {
      await validateMongooseObjectId(requesterId);
    } catch {
      validationErrors.push({
        field: "UserId",
        error: "Invalid UserId from token",
      });
    }

    if (page && isNaN(parseInt(page as string))) {
      validationErrors.push({
        field: "page",
        error: "Page must be a number",
      });
    }

    if (size && isNaN(parseInt(size as string))) {
      validationErrors.push({
        field: "size",
        error: "Size must be a number",
      });
    }

    if (order && !["ascending", "descending"].includes(order as string)) {
      validationErrors.push({ field: "order", error: "Invalid order" });
    }

    if (sortBy && !["date"].includes(sortBy as string)) {
      validationErrors.push({ field: "sortBy", error: "Invalid sort by" });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { content } = req.body;
    const requesterId = req.userInfo.userId;

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "PostId",
        error: "Invalid PostId",
      });
    }

    try {
      await validateMongooseObjectId(requesterId);
    } catch {
      validationErrors.push({
        field: "UserId",
        error: "Invalid UserId from token",
      });
    }

    if (!content) {
      validationErrors.push({
        field: "content",
        error: "Content is required",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const requesterId = req.userInfo.userId;

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "PostId",
        error: "Invalid PostId",
      });
    }

    try {
      await validateMongooseObjectId(requesterId);
    } catch {
      validationErrors.push({
        field: "UserId",
        error: "Invalid UserId from token",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
      return;
    } else {
      next();
    }
  };
}

export default CommentHandler;
