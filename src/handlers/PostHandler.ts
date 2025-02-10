import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";
import { JSDOM } from "jsdom";
import validator from "validator";

class PostHandler {
  constructor() {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { title, content } = req.body;

    if (!title && !validator.isLength(title, { min: 6, max: 150 })) {
      validationErrors.push({
        field: "title",
        error: "Title is required and should be between 6 and 150 characters",
      });
    }

    if (!content) {
      validationErrors.push({ field: "content", error: "Content is required" });
    }

    const dom = new JSDOM(content);
    const document = dom.window.document;
    const images = document.querySelectorAll("img");

    if (images.length > 0) {
      // console.log(images.length);

      const files = req.files as
        | { [key: string]: Express.Multer.File[] }
        | undefined;

      const attachmentCount = files?.postAttachments
        ? files.postAttachments.length
        : 0;
      // console.log(attachmentCount);

      if (images.length !== attachmentCount) {
        validationErrors.push({
          field: "postAttachments",
          error: `The number of images in content (${images.length}) does not match the uploaded images (${attachmentCount}).`,
        });
      }
    }

    try {
      await validateMongooseObjectId(req.userInfo.userId);
    } catch {
      validationErrors.push({ field: "userId", error: "Invalid user id" });
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

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({ field: "id", error: "Invalid post id" });
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
  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { page, size, order, sortBy } = req.query;

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

  updatePosts = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { title, content } = req.body;

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({ field: "id", error: "Invalid post Id" });
    }

    if (title && !validator.isLength(title, { min: 6, max: 150 })) {
      validationErrors.push({
        field: "title",
        error: "Title is required and should be between 6 and 150 characters",
      });
    }

    if (!content) {
      validationErrors.push({ field: "content", error: "Content is required" });
    }

    const dom = new JSDOM(content);
    const document = dom.window.document;
    const images = document.querySelectorAll("img");

    if (images.length > 0) {
      const files = req.files as
        | { [key: string]: Express.Multer.File[] }
        | undefined;

      const attachmentCount = files?.postAttachments
        ? files.postAttachments.length
        : 0;

      if (images.length !== attachmentCount) {
        validationErrors.push({
          field: "postAttachments",
          error: `The number of images in content (${images.length}) does not match the uploaded images (${attachmentCount}).`,
        });
      }
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

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({ field: "id", error: "Invalid post Id" });
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
}

export default PostHandler;
