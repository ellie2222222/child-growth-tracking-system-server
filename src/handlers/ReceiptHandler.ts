import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class ReceiptHandler {
  getReceiptsByUserId = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const { userId } = req.query;
    if (!userId) {
      res.status(400).send({ message: "User ID is required" });
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
