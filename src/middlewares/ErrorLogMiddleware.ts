import path from "path";
import { Request, Response, NextFunction } from "express";
import getLogger from "../utils/logger";
import StatusCodeEnums from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import ErrorLogRepository from "../repositories/ErrorLogRepository";
import CustomException from "../exceptions/CustomException";
import mongoose from "mongoose";

// Get logger instance for error logging
const logger = getLogger("ERROR_LOG");

const ErrorLogMiddleware = async (
  err: CustomException,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const database = Database.getInstance();
  const session: mongoose.ClientSession = await database.startTransaction();

  try {
    const stack = err.stack || "";

    // Parse the stack trace to extract function, file, and line number details
    const match = stack.match(/\s+at (\S+) \((.*):(\d+):(\d+)\)/);
    const filePath = match ? match[2] : "Unknown file";
    const fileName = path.basename(filePath);

    const logMessage = `
    An error occurred in the application:
    Error Code: ${err.code || StatusCodeEnums.InternalServerError_500}
    Message: ${err.message}
    File: ${fileName}
    Stack Trace:
    ${stack}
    `;

    // Log the error details
    logger.error(logMessage);

    // Only log specific error codes to the database
    const errorCodes = [
      StatusCodeEnums.InternalServerError_500,
      StatusCodeEnums.Unauthorized_401,
      StatusCodeEnums.Forbidden_403,
    ];
    if (errorCodes.includes(err.code)) {
      const errorLogData = {
        errorCode: err.code?.toString() || "500",
        message: err.message,
        file: fileName,
        stackTrace: stack,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const errorLogRepository = new ErrorLogRepository();
      await errorLogRepository.createErrorLog(errorLogData, session);
      await database.commitTransaction(session);

      logger.info(`Error Log saved to database`);
    }
  } catch (error) {
    await database.abortTransaction(session);
    if (error as Error) {
      logger.error(
        `Error saving error to database: ${(error as Error).message}`
      );
    } else if (error as CustomException) {
      logger.error(
        `Error saving error to database: ${(error as CustomException).message}`
      );
    }
  } finally {
    if (err.name && err.name.toLowerCase().includes("mongo")) {
      res
        .status(StatusCodeEnums.InternalServerError_500)
        .json({ message: `Database Error: ${err.message}` });
    }

    const statusCode = Object.values(StatusCodeEnums).includes(err.code || 0)
      ? err.code || StatusCodeEnums.InternalServerError_500
      : StatusCodeEnums.InternalServerError_500;

    res.status(statusCode).json({ message: err.message });
  }
};

export default ErrorLogMiddleware;
