import { Document } from "mongoose";

export interface IConfig extends Document {
  key: string;
  value: string;
  description: string;
}
