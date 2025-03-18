import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { JSDOM } from "jsdom";

class ConsultationMessageHandler {
  createConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { consultationId, message } = req.body;

    try {
      validateMongooseObjectId(consultationId);
    } catch {
      validationErrors.push({
        field: "ConsultationId",
        error: "Invalid consultationId",
      });
    }

    if (!message) {
      validationErrors.push({
        field: "Message",
        error: "Message is required",
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

  updateConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { message } = req.body;

    const files = (req.files as Express.Multer.File[]) || [];

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "MessageId",
        error: "Invalid consultation message Id",
      });
    }
    if (message) {
      if (files && files.length > 0) {
        const fileCount = files ? files.length : 0;

        const dom = new JSDOM(message);
        const document = dom.window.document;
        const images = document.querySelectorAll("img");
        if (files.length !== images.length) {
          validationErrors.push({
            field: "Images",
            error: `The number of images in message (${images.length}) does not match the uploaded images (${fileCount}).`,
          });
        }
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

  deleteConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "MessageId",
        error: "Invalid consultation message Id",
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

  getConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "MessageId",
        error: "Invalid consultation message Id",
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

  getConsultationMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { page, size, order, sortBy } = req.query;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "ConsultationId",
        error: "Invalid consultationId",
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
}

export default ConsultationMessageHandler;
