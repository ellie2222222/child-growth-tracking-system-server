import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";
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
    } catch (error) {
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
}

export default UserHandler;
