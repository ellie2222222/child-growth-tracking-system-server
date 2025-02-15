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
    const { name, email, password, phoneNumber, type } = req.body;
    const validationErrors: { field: string; error: string }[] = [];

    switch (type) {
      case "doctor":
        try {
          await validateName(name);
        } catch (error) {
          validationErrors.push({
            field: "Invalid doctor field",
            error: (error as CustomException | Error).message,
          });
        }

        try {
          await validateEmail(email);
        } catch (error) {
          validationErrors.push({
            field: "Invalid doctor field",
            error: (error as CustomException | Error).message,
          });
        }

        try {
          await validatePassword(password);
        } catch (error) {
          validationErrors.push({
            field: "Invalid doctor field",
            error: (error as CustomException | Error).message,
          });
        }

        try {
          await validatePhoneNumber(phoneNumber);
        } catch (error) {
          validationErrors.push({
            field: "Invalid doctor field",
            error: (error as CustomException | Error).message,
          });
        }
        break;

      case "admin":
        try {
          await validateName(name);
        } catch (error) {
          validationErrors.push({
            field: "Invalid admin field",
            error: (error as CustomException | Error).message,
          });
        }

        try {
          await validatePassword(password);
        } catch (error) {
          validationErrors.push({
            field: "Invalid admin field",
            error: (error as CustomException | Error).message,
          });
        }
        if (email && email !== "") {
          try {
            await validateEmail(email);
          } catch (error) {
            validationErrors.push({
              field: "Invalid admin field",
              error: (error as CustomException | Error).message,
            });
          }
        }
        if (phoneNumber && phoneNumber !== "") {
          try {
            await validatePhoneNumber(phoneNumber);
          } catch (error) {
            validationErrors.push({
              field: "invalid admin field",
              error: (error as CustomException | Error).message,
            });
          }
        }
        break;

      default:
        break;
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
      await validateMongooseObjectId(id);
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
    const { page, size, search, order, sortBy } = req.query;
    if (Number.isNaN(page)) {
      validationErrors.push({
        field: "Invalid query field",
        error: "Invalid page number in query",
      });
    }
    if (Number.isNaN(size)) {
      validationErrors.push({
        field: "Invalid query field",
        error: "Invalid page number in query",
      });
    }
    if (!["ascending", "descending"].includes(order as string)) {
      validationErrors.push({
        field: "Invalid query field",
        error: "Invalid order in query",
      });
    }
    if (!["date"].includes(sortBy as string)) {
      validationErrors.push({
        field: "Invalid query field",
        error: "Invalid sortBy in query",
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

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;
    const { name } = req.body;
    try {
      await validateMongooseObjectId(id);
    } catch (error) {
      validationErrors.push({
        field: "Invalid params field",
        error: (error as Error | CustomException).message,
      });
    }
    try {
      await validateName(name);
    } catch (error) {
      validationErrors.push({
        field: "Invalid body field",
        error: (error as Error | CustomException).message,
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

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { id } = req.params;

    try {
      await validateMongooseObjectId(id);
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
      await validateMongooseObjectId(id);
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
}

export default UserHandler;
