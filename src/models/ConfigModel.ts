import mongoose, { Schema, Model } from "mongoose";
import { IConfig } from "../interfaces/IConfig";

const configSchema = new Schema<IConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true, strict: true }
);

const ConfigModel: Model<IConfig> = mongoose.model<IConfig>(
  "Config",
  configSchema
);

export default ConfigModel;
