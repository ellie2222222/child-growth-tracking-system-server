import { Schema, Document} from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId | string;
  ipAddress: string;
  expiresAt: Date;
  userAgent: string;
  browser: {
    name?: string | undefined,
    version?: string | undefined,
  };
  device: {
    type?: string | undefined,
    model?: string | undefined,
    vendor?: string | undefined,
  };
  os: {
    name?: string | undefined,
    version?: string | undefined,
  };
  country: string;
  region: string;
  timezone: string;
  city: string;
  ll: Array<Number>;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
