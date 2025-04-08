import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import getLogger from "../utils/logger";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import IJwtPayload from "../interfaces/models/IJwtPayload";
import CustomException from "../exceptions/CustomException";

const logger = getLogger("AUTHENTICATION");

const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const isProtectedRoute = req.isProtectedRoute;
  // const token = req.cookies?.accessToken || "";

  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1] || req.cookies?.accessToken || ""; //for swagger test and cookie

  if (!isProtectedRoute) {
    try {
      logger.info("Handling public route");

      if (token) {
        const { userId } = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET!
        ) as IJwtPayload;

        if (mongoose.Types.ObjectId.isValid(userId)) {
          req.userInfo = { ...req.userInfo, userId };
          logger.info(`Valid token for User ID: ${userId}`);
        } else {
          logger.warn("Invalid user ID in token.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          logger.warn("Token expired.");
        } else if (error.name === "JsonWebTokenError") {
          logger.warn("Invalid token.");
        } else {
          logger.error(`Token verification error: ${error.message}`);
        }
      }
    }

    next();
    return;
  }

  // Handle protected route
  if (!token) {
    res
      .status(StatusCodeEnum.Forbidden_403)
      .json({ message: "Authorization token required" });
    return;
  }

  try {
    const { userId, email, role } = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as IJwtPayload;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res
        .status(StatusCodeEnum.Unauthorized_401)
        .json({ message: "Invalid access token. Request is not authorized." });
      return;
    }

    // Attach user info to request for further processing
    req.userInfo = { ...req.userInfo, userId, email, role };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        res
          .status(StatusCodeEnum.Unauthorized_401)
          .json({ message: "Access token expired. Please log in again." });
        return;
      } else if (error.name === "JsonWebTokenError") {
        res.status(StatusCodeEnum.Unauthorized_401).json({
          message: "Invalid access token. Request is not authorized.",
        });
        return;
      }
    }
    res
      .status(StatusCodeEnum.InternalServerError_500)
      .json({ message: (error as Error).message });
  }
};

export default AuthMiddleware;
