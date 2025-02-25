import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";
class TierHandler {
  createTier = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];
    const {
      tier,
      childrenLimit,
      postsLimitValue,
      postLimitTime,
      updateRecordsLimitValue,
      updateRecordsLimitTime,
      viewRecordsLimitValue,
      viewRecordsLimitTime,
    } = req.body;

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
        error: "childrenLimit should be a non-negative integer",
      });
    }

    if (postsLimitValue === null || postsLimitValue === undefined) {
      validationErrors.push({
        field: "PostLimitValue",
        error: "PostLimitValue is required",
      });
    }

    if (!Number.isInteger(postsLimitValue) || postsLimitValue < 0) {
      validationErrors.push({
        field: "PostLimitValue",
        error: "PostLimitValue should be a non-negative integer",
      });
    }

    if (postLimitTime === null || postLimitTime === undefined) {
      validationErrors.push({
        field: "PostLimitTime",
        error: "PostLimitTime is required",
      });
    }

    if (!Number.isInteger(postLimitTime) || postLimitTime < 0) {
      validationErrors.push({
        field: "postLimitTime",
        error: "postLimitTime should be a non-negative integer",
      });
    }

    if (
      updateRecordsLimitValue === null ||
      updateRecordsLimitValue === undefined
    ) {
      validationErrors.push({
        field: "updateRecordsLimitValue",
        error: "updateRecordsLimitValue is required",
      });
    }

    if (
      !Number.isInteger(updateRecordsLimitValue) ||
      updateRecordsLimitValue < 0
    ) {
      validationErrors.push({
        field: "updateRecordsLimitValue",
        error: "updateRecordsLimitValue should be a non-negative integer",
      });
    }

    if (
      updateRecordsLimitTime === null ||
      updateRecordsLimitTime === undefined
    ) {
      validationErrors.push({
        field: "updateRecordsLimitTime",
        error: "updateRecordsLimitTime is required",
      });
    }

    if (
      !Number.isInteger(updateRecordsLimitTime) ||
      updateRecordsLimitTime < 0
    ) {
      validationErrors.push({
        field: "updateRecordsLimitTime",
        error: "updateRecordsLimitTime should be a non-negative integer",
      });
    }

    if (viewRecordsLimitValue === null || viewRecordsLimitValue === undefined) {
      validationErrors.push({
        field: "viewRecordsLimitValue",
        error: "viewRecordsLimitValue is required",
      });
    }

    if (!Number.isInteger(viewRecordsLimitValue) || viewRecordsLimitValue < 0) {
      validationErrors.push({
        field: "viewRecordsLimitValue",
        error: "viewRecordsLimitValue should be a non-negative integer",
      });
    }

    if (viewRecordsLimitTime === null || viewRecordsLimitTime === undefined) {
      validationErrors.push({
        field: "viewRecordsLimitTime",
        error: "viewRecordsLimitTime is required",
      });
    }

    if (!Number.isInteger(viewRecordsLimitTime) || viewRecordsLimitTime < 0) {
      validationErrors.push({
        field: "viewRecordsLimitTime",
        error: "viewRecordsLimitTime should be a non-negative integer",
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
    const {
      tier,
      childrenLimit,
      postsLimitValue,
      postLimitTime,
      updateRecordsLimitValue,
      updateRecordsLimitTime,
      viewRecordsLimitValue,
      viewRecordsLimitTime,
    } = req.body;

    if (tier && ![0, 1, 2].includes(tier)) {
      validationErrors.push({
        field: "tier",
        error: "Invalid tier. It should be 0, 1 or 2",
      });
    }

    if (
      (childrenLimit !== undefined && !Number.isInteger(childrenLimit)) ||
      childrenLimit < 0
    ) {
      validationErrors.push({
        field: "childrenLimit",
        error: "childrenLimit must be a non-negative integer ",
      });
    }

    if (
      postsLimitValue !== undefined &&
      (!Number.isInteger(postsLimitValue) || postsLimitValue < 0)
    ) {
      validationErrors.push({
        field: "postsLimitValue",
        error: "postsLimitValue should be a non-negative integer",
      });
    }

    if (
      postLimitTime !== undefined &&
      (!Number.isInteger(postLimitTime) || postLimitTime < 0)
    ) {
      validationErrors.push({
        field: "postLimitTime",
        error: "postLimitTime should be a non-negative integer",
      });
    }

    if (
      updateRecordsLimitValue !== undefined &&
      (!Number.isInteger(updateRecordsLimitValue) ||
        updateRecordsLimitValue < 0)
    ) {
      validationErrors.push({
        field: "updateRecordsLimitValue",
        error: "updateRecordsLimitValue should be a non-negative integer",
      });
    }

    if (
      updateRecordsLimitTime !== undefined &&
      (!Number.isInteger(updateRecordsLimitTime) || updateRecordsLimitTime < 0)
    ) {
      validationErrors.push({
        field: "updateRecordsLimitTime",
        error: "updateRecordsLimitTime should be a non-negative integer",
      });
    }

    if (
      viewRecordsLimitValue !== undefined &&
      (!Number.isInteger(viewRecordsLimitValue) || viewRecordsLimitValue < 0)
    ) {
      validationErrors.push({
        field: "viewRecordsLimitValue",
        error: "viewRecordsLimitValue should be a non-negative integer",
      });
    }

    if (
      viewRecordsLimitTime !== undefined &&
      (!Number.isInteger(viewRecordsLimitTime) || viewRecordsLimitTime < 0)
    ) {
      validationErrors.push({
        field: "viewRecordsLimitTime",
        error: "viewRecordsLimitTime should be a non-negative integer",
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
