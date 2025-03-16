import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import {
  validateEmail,
  validateMongooseObjectId,
  validateName,
  validatePassword,
  validatePhoneNumber,
} from "../utils/validator";
import CustomException from "../exceptions/CustomException";
import UserEnum from "../enums/UserEnum";

class UserHandler {
  /**
   * Validates input for login requests.
   */
  updateRole = (req: Request, res: Response, next: NextFunction): void => {
    const { userId } = req.params;
    const { role } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate userId
    try {
      validateMongooseObjectId(userId);
    } catch {
      validationErrors.push({
        field: "userId",
        error: "Invalid user ID",
      });
    }

    // Validate role
    const userEnumValues = Object.values(UserEnum);
    if (!userEnumValues.includes(role)) {
      validationErrors.push({
        field: "role",
        error: "Invalid role, [0: member, 1: admin, 3: doctor]",
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

  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { name, email, password, phoneNumber, role } = req.body;
    const validationErrors: { field: string; error: string }[] = [];

    if (![UserEnum.MEMBER, UserEnum.ADMIN, UserEnum.DOCTOR].includes(role)) {
      validationErrors.push({
        field: "role",
        error: "Invalid role for user",
      });
    }

    try {
      validateName(name);
    } catch (error) {
      validationErrors.push({
        field: "Invalid doctor field",
        error: (error as CustomException | Error).message,
      });
    }

    try {
      validateEmail(email);
    } catch (error) {
      validationErrors.push({
        field: "Invalid doctor field",
        error: (error as CustomException | Error).message,
      });
    }

    try {
      validatePassword(password);
    } catch (error) {
      validationErrors.push({
        field: "Invalid doctor field",
        error: (error as CustomException | Error).message,
      });
    }

    try {
      validatePhoneNumber(phoneNumber);
    } catch (error) {
      validationErrors.push({
        field: "Invalid doctor field",
        error: (error as CustomException | Error).message,
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

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validationErrors: { field: string; error: string }[] = [];
    try {
      const { id } = req.params;
      validateMongooseObjectId(id);
    } catch (error) {
      validationErrors.push({
        field: "Invalid userId ",
        error: (error as CustomException | Error).message,
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

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { page, size, order, sortBy } = req.query;
    // Validate page (minimum 1)
    const parsedPage = parseInt(page as string, 10);
    if (page && (!Number.isInteger(parsedPage) || parsedPage < 1)) {
      validationErrors.push({
        field: "page",
        error: "Page must be an integer greater than or equal to 1",
      });
    }

    // Validate size (minimum 1)
    const parsedSize = parseInt(size as string, 10);
    if (size && (!Number.isInteger(parsedSize) || parsedSize < 1)) {
      validationErrors.push({
        field: "size",
        error: "Size must be an integer greater than or equal to 1",
      });
    }

    // Validate sortBy (enum: 'date', 'name')
    const validSortBy = ["date", "name"];
    if (sortBy && !validSortBy.includes(sortBy as string)) {
      validationErrors.push({
        field: "sortBy",
        error: `Sort by must be one of: ${validSortBy.join(", ")}`,
      });
    }

    // Validate order (enum: 'ascending', 'descending')
    const validOrder = ["ascending", "descending"];
    if (order && !validOrder.includes(order as string)) {
      validationErrors.push({
        field: "order",
        error: `Order must be one of: ${validOrder.join(", ")}`,
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      req.query.sortBy = sortBy || "date";
      req.query.order = order || "descending";
      req.query.page = page ? parsedPage.toString() : "1";
      req.query.size = size ? parsedSize.toString() : "10";

      next();
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;
    const { name, role, phoneNumber } = req.body;
    // Validate user ID
    try {
      validateMongooseObjectId(id);
    } catch (error) {
      validationErrors.push({
        field: "id",
        error: (error as Error | CustomException).message,
      });
    }

    // Validate role
    if (role !== undefined) {
      const validRoles = [UserEnum.MEMBER, UserEnum.ADMIN, UserEnum.DOCTOR];
      if (!validRoles.includes(Number(role))) {
        validationErrors.push({
          field: "role",
          error: `Invalid role. Allowed values: ${UserEnum.MEMBER} (member), ${UserEnum.ADMIN} (admin), ${UserEnum.DOCTOR} (doctor)`,
        });
      }
    }

    // Validate name
    if (name) {
      try {
        validateName(name);
      } catch (error) {
        validationErrors.push({
          field: "name",
          error: (error as Error | CustomException).message,
        });
      }
    }

    // Validate phone number
    if (phoneNumber) {
      try {
        validatePhoneNumber(phoneNumber);
      } catch (error) {
        validationErrors.push({
          field: "phoneNumber",
          error: (error as Error | CustomException).message,
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

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch (error) {
      validationErrors.push({
        field: "Invalid params field",
        error: (error as Error | CustomException).message,
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

  removeCurrentSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch (error) {
      validationErrors.push({
        field: "Invalid userId",
        error: (error as Error | CustomException).message,
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

  createConsultationRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { rating } = req.body;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "id",
        error: "Invalid consultationId",
      });
    }

    if (rating < 1 || rating > 5) {
      validationErrors.push({
        field: "rating",
        error: "Rating must be between 1 and 5",
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

  updateConsultationRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { rating } = req.body;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "id",
        error: "Invalid consultationId",
      });
    }

    if (rating < 1 || rating > 5) {
      validationErrors.push({
        field: "rating",
        error: "Rating must be between 1 and 5",
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

  removeConsultationRating = async (
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
        field: "id",
        error: "Invalid consultationId",
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

export default UserHandler;
