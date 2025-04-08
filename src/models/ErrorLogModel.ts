import mongoose, { Schema, Document, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IErrorLog } from "../interfaces/models/IErrorLog";

const errorLogModelSchema = new Schema<IErrorLog>(
  {
    errorCode: { type: String, required: true },
    message: { type: String, required: true },
    file: { type: String, required: true },
    stackTrace: { type: String, required: true },
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

const ErrorLogModel: Model<IErrorLog> = mongoose.model<IErrorLog>("ErrorLog", errorLogModelSchema);

export default ErrorLogModel;
