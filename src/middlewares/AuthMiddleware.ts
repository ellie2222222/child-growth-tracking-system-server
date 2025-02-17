import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import getLogger from "../utils/logger";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import IJwtPayload from "../interfaces/IJwtPayload";
import CustomException from "../exceptions/CustomException";
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
          userId,
        };
        logger.info(`Valid token for User ID: ${userId}`);
      } else {
        logger.warn("Invalid user ID in token.");
      }
    } catch (error) {
      if (error as Error) {
        if ((error as Error).name === "TokenExpiredError") {
          logger.warn("Token expired.");
        } else if ((error as Error).name === "JsonWebTokenError") {
          logger.warn("Invalid token.");
        } else {
          logger.error(`Token verification error: ${(error as Error).message}`);
        }
      } else {
        if (error as CustomException) {
          logger.error(
            `Token verification error: ${(error as CustomException).message}`
          );
        }
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
    return;
  } else {
    const token = authorization.split(" ")[1];

    try {
      const { userId, email, role } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as IJwtPayload;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(StatusCodeEnum.Unauthorized_401)
          .json({ message: "Invalid token. Request is not authorized." });
        return;
      }

      // Attach information to req for further process
      req.userInfo = {
        ...req.userInfo,
        userId,
        email,
        role,
      };

      next();
    } catch (error) {
      if (error as Error) {
        if ((error as Error).name === "TokenExpiredError") {
          res.status(StatusCodeEnum.Unauthorized_401).json({
            message: "Token expired. Please log in again.",
          });

          return;
        } else if ((error as Error).name === "JsonWebTokenError") {
          res.status(StatusCodeEnum.Unauthorized_401).json({
            message: "Invalid token. Request is not authorized.",
          });

          return;
        }
      }
      res
        .status(StatusCodeEnum.InternalServerError_500)
        .json({ message: (error as Error).message });
      return;
    }
  }
};

export default AuthMiddleware;
