import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class ReceiptHandler {
  getAllReceipts = (req: Request, res: Response, next: NextFunction): void => {
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

  getReceiptsByUserId = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { page, size, order, sortBy } = req.query;
    const { userId } = req.params;

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

    if (!userId) {
      validationErrors.push({
        field: "userId",
        error: "User ID is required",
      });
    }
    try {
      validateMongooseObjectId(userId as string);
    } catch {
      validationErrors.push({
        field: "userId",
        error: "Invalid user ID",
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
  getReceiptById = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;
    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "Id",
        error: "Invalid receipt ID",
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
  deleteReceiptById = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;
    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "Id",
        error: "Invalid receipt ID",
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
}

export default ReceiptHandler;
