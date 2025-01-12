import mongoose from "mongoose";
import ErrorLogModel from "../models/ErrorLogModel";
import { IErrorLog } from "../interfaces/IErrorLog";

class ErrorLogRepository {
  /**
   * Create a new error log entry.
   * @param errorData - Object containing error details adhering to IErrorLog.
   * @returns The created error log document.
   * @throws Error when the creation fails.
   */
  async createErrorLog(
    errorData: Object,
    session?: mongoose.ClientSession
  ): Promise<IErrorLog> {
    try {
      const errorLog = await ErrorLogModel.create([errorData], { session });

      return errorLog[0];
    } catch (error: any) {
      throw new Error(`Failed to create error log: ${error.message}`);
    }
  }
}

export default ErrorLogRepository;
