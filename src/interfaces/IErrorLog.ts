import { Document } from "mongoose";

export interface IErrorLog extends Document {
  errorCode: string;
  message: string;
  file: string;
  stackTrace: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
