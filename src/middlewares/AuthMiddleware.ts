import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { match } from "path-to-regexp";
import publicRoutes from "../routes/PublicRoute";
import getLogger from "../utils/logger";
import StatusCodeEnum from "../enums/StatusCodeEnum";
const logger = getLogger("AUTHENTICATION");

interface JwtPayload {
  userId: string;
  email: string;
}

const isPublicRoute = (path: string, method: string): boolean => {
  const pathname = path.split("?")[0];

  const matchedRoute = publicRoutes.find((route) => {
    const matchFn = match(route.path, { decode: decodeURIComponent });
    const matched = matchFn(pathname);
    return matched && route.method === method;
  });

  return !!matchedRoute;
};

const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Handle public route
  const isPublic = isPublicRoute(req.originalUrl, req.method);
  const { authorization } = req.headers;

  if (isPublic) {
    try {
      const token = authorization?.split(" ")[1] || "";
      const { userId } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      if (mongoose.Types.ObjectId.isValid(userId)) {
        req.user = {
          ...req.user,
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
      ) as JwtPayload;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res
          .status(StatusCodeEnum.Unauthorized_401)
          .json({ message: "Invalid token. Request is not authorized." });
      }

      // Attach information to req for further process
      req.user = {
        ...req.user,
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
