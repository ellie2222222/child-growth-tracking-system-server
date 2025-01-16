import mongoose, { Schema, Document } from "mongoose";

export interface IBaseEntity extends Document {
  isDeleted: boolean;
}

const baseModelSchema = new Schema<IBaseEntity>(
  {
    isDeleted: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
);

export default baseModelSchema;
