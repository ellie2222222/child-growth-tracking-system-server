import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import validator from "validator";
import { validateMongooseObjectId } from "../utils/validator";
class MembershipPackageHandler {
  createMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { price, duration, unit, name, description, tier } = req.body;

    if (
      !price ||
      isNaN(parseFloat(price as string)) ||
      parseFloat(price as string) <= 0
    ) {
      validationErrors.push({
        field: "Price",
        error: "Invalid price: price must be a positive number",
      });
    }

    if (
      !duration ||
      isNaN(parseInt(duration as string)) ||
      parseInt(duration as string) <= 0 ||
      !Number.isInteger(parseInt(duration as string))
    ) {
      validationErrors.push({
        field: "Duration",
        error: "Invalid duration: price must be a positive integer",
      });
    }

    if (!["USD", "VND"].includes(unit)) {
      validationErrors.push({
        field: "Unit",
        error: "Invalid unit: unit must be USD or VND",
      });
    }

    if (!name || !validator.isLength(name, { min: 6, max: 100 })) {
      validationErrors.push({
        field: "Name",
        error: "Invalid name: name must be between 6 and 100 characters",
      });
    }

    if (!description) {
      validationErrors.push({
        field: "Description",
        error: "Invalid description: description is required",
      });
    }

    if (!tier || ![1, 2].includes(tier)) {
      validationErrors.push({
        field: "Tier",
        error: "Invalid tier: premium tier must be 1 or 2",
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

  updateMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { price, duration, unit, name, tier } = req.body;

    try {
      validateMongooseObjectId(id as string);
    } catch {
      validationErrors.push({
        field: "MembershipPackageId",
        error:
          "Invalid MembershipPackageId: id must be a valid MongoDB ObjectId",
      });
    }

    if (
      price &&
      (isNaN(parseFloat(price as string)) || parseFloat(price as string) <= 0)
    ) {
      validationErrors.push({
        field: "Price",
        error: "Invalid price: price must be a positive number",
      });
    }

    if (
      duration &&
      (isNaN(parseInt(duration as string)) ||
        parseInt(duration as string) <= 0 ||
        !Number.isInteger(parseInt(duration as string)))
    ) {
      validationErrors.push({
        field: "Duration",
        error: "Invalid duration: price must be a positive integer",
      });
    }

    if (unit && !["USD", "VND"].includes(unit)) {
      validationErrors.push({
        field: "Unit",
        error: "Invalid unit: unit must be USD or VND",
      });
    }

    if (name && !validator.isLength(name, { min: 6, max: 100 })) {
      validationErrors.push({
        field: "Name",
        error: "Invalid name: name must be between 6 and 100 characters",
      });
    }

    if (tier && ![1, 2].includes(tier)) {
      validationErrors.push({
        field: "Tier",
        error: "Invalid tier: premium tier must be 1 or 2",
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

  deleteMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id as string);
    } catch {
      validationErrors.push({
        field: "MembershipPackageId",
        error:
          "Invalid MembershipPackageId: id must be a valid MongoDB ObjectId",
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

  getMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id as string);
    } catch {
      validationErrors.push({
        field: "MembershipPackageId",
        error:
          "Invalid MembershipPackageId: id must be a valid MongoDB ObjectId",
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

  getMembershipPackages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { page, size, order, sortBy } = req.query;

    if (page && isNaN(parseInt(page as string))) {
      validationErrors.push({
        field: "Page",
        error: "Invalid Page: page must be a valid integer",
      });
    }

    if (size && isNaN(parseInt(size as string))) {
      validationErrors.push({
        field: "Size",
        error: "Invalid Size: size must be a valid integer",
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
      return;
    } else {
      next();
    }
  };
}

export default MembershipPackageHandler;
