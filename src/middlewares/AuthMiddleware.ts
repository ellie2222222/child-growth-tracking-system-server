import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import getLogger from "../utils/logger";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import IJwtPayload from "../interfaces/IJwtPayload";
const logger = getLogger("AUTHENTICATION");

const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Handle public route
  const isProtectedRoute = req.isProtectedRoute;
  const { authorization } = req.headers;

  if (!isProtectedRoute) {
    try {
      logger.info("Handling public route");
      const token = authorization?.split(" ")[1] || "";
      const { userId } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as IJwtPayload;

      if (mongoose.Types.ObjectId.isValid(userId)) {
        req.userInfo = {
          ...req.userInfo,
          userId
        };
        logger.info(`Valid token for User ID: ${userId}`);
      } else {
        logger.warn("Invalid user ID in token.");
      }
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        logger.warn("Token expired.");
      } else if (error.name === "JsonWebTokenError") {
        logger.warn("Invalid token.");
      } else {
        logger.error(`Token verification error: ${error.message}`);
      }
    }

    next();
    return;
  }

  // Handle protected route
  if (!authorization) {
    res
      .status(StatusCodeEnum.Unauthorized_401)
      .json({ message: "Authorization token required" });
  } else {
    const token = authorization.split(" ")[1];

    try {
      const { userId, email } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as IJwtPayload;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(StatusCodeEnum.Unauthorized_401)
          .json({ message: "Invalid token. Request is not authorized." });
      }

      // Attach information to req for further process
      req.userInfo = {
        ...req.userInfo,
        userId,
        email,
      };

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(StatusCodeEnum.Unauthorized_401).json({
          message: "Token expired. Please log in again.",
        });

        return;
      } else if (error.name === "JsonWebTokenError") {
        res.status(StatusCodeEnum.Unauthorized_401).json({
          message: "Invalid token. Request is not authorized.",
        });

        return;
      }
      res
        .status(StatusCodeEnum.InternalServerError_500)
        .json({ message: error.message });
    }
  }
};

export default AuthMiddleware;
