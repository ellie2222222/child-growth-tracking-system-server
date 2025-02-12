import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";
class TierHandler {
  createTier = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const { tier, childrenLimit, postsLimit } = req.body;

    if (![0, 1, 2].includes(tier)) {
      validationErrors.push({
        field: "tier",
        error: "Invalid tier. It should be 0, 1 or 2",
      });
    }

    if (childrenLimit === null || childrenLimit === undefined) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit is required",
      });
    }

    if (!Number.isInteger(childrenLimit) || childrenLimit < 0) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit should be a positive integer",
      });
    }

    if (postsLimit === null || postsLimit === undefined) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit is required",
      });
    }

    if (!Number.isInteger(postsLimit) || postsLimit < 0) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit should be a positive integer",
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

  updateTier = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const { tier, childrenLimit, postsLimit } = req.body;

    if (tier && ![0, 1, 2].includes(tier)) {
      validationErrors.push({
        field: "tier",
        error: "Invalid tier. It should be 0, 1 or 2",
      });
    }

    if (
      (childrenLimit && !Number.isInteger(childrenLimit)) ||
      childrenLimit < 0
    ) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit is must be an integer ",
      });
    }

    if ((postsLimit && !Number.isInteger(postsLimit)) || postsLimit < 0) {
      validationErrors.push({
        field: "postsLimit",
        error: "postsLimit must be an integer ",
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

  getTiers = async (req: Request, res: Response, next: NextFunction) => {
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

  getTier = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    try {
      await validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "TierId",
        error: "Invalid TierId",
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

export default TierHandler;
