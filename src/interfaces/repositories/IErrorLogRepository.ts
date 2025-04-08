import mongoose from "mongoose";
import { IErrorLog } from "../models/IErrorLog";

export interface IErrorLogRepository {
  createErrorLog(errorData: object, session?: mongoose.ClientSession): Promise<IErrorLog>;
}
