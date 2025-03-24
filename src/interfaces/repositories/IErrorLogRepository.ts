import mongoose from "mongoose";
import { IErrorLog } from "../IErrorLog";

export interface IErrorLogRepository {
  createErrorLog(errorData: object, session?: mongoose.ClientSession): Promise<IErrorLog>;
}
