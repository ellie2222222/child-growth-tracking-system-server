import mongoose from "mongoose";
import ErrorLogModel from "../models/ErrorLogModel";
import { IErrorLog } from "../interfaces/models/IErrorLog";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IErrorLogRepository } from "../interfaces/repositories/IErrorLogRepository";

class ErrorLogRepository implements IErrorLogRepository {
  /**
   * Create a new error log entry.
   * @param errorData - Object containing error details adhering to IErrorLog.
   * @returns The created error log document.
   * @throws Error when the creation fails.
   */
  async createErrorLog(
    errorData: object,
    session?: mongoose.ClientSession
  ): Promise<IErrorLog> {
    try {
      const errorLog = await ErrorLogModel.create([errorData], { session });

      return errorLog[0];
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to create error log: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default ErrorLogRepository;
