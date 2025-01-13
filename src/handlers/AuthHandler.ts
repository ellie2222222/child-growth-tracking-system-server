import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import validator from "validator";

class AuthHandler {
  /**
   * Validates input for login requests.
   */
  login = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate email
    if (!email || !validator.isEmail(email)) {
      validationErrors.push({
        field: "email",
        error: "Invalid email format",
      });
    }

    // Validate password
    if (
      !password ||
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      password.length > 50
    ) {
      validationErrors.push({
        field: "password",
        error:
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
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

  /**
   * Validates input for signup requests.
   */
  signup = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email, password } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate name
    if (!name || !validator.isLength(name, { min: 1 })) {
      validationErrors.push({
        field: "name",
        error: "Name must be at least 1 characters long",
      });
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
      validationErrors.push({
        field: "email",
        error: "Invalid email format",
      });
    }

    // Validate password
    if (
      !password ||
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      password.length > 50
    ) {
      validationErrors.push({
        field: "password",
        error:
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
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

  /**
   * Validates input for reset password requests.
   */
  resetPassword = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { newPassword } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate password
    if (
      !newPassword ||
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      newPassword.length > 50
    ) {
      validationErrors.push({
        field: "newPassword",
        error:
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
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

  /**
   * Validates input for change password requests.
   */
  changePassword = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { oldPassword, newPassword } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate old password
    if (!oldPassword || oldPassword === "") {
      validationErrors.push({
        field: "oldPassword",
        error: "Old password is empty",
      });
    }

    // Validate new password
    if (
      !newPassword ||
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) ||
      newPassword.length > 50
    ) {
      validationErrors.push({
        field: "newPassword",
        error:
          "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol, and be between 8-50 characters long",
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

  /**
   * Validates input for verify email requests.
   */
  verifyEmail = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { email } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate email
    if (!email || !validator.isEmail(email)) {
      validationErrors.push({
        field: "email",
        error: "Invalid email format",
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

export default AuthHandler;
