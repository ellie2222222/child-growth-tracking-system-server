import { model, Schema } from "mongoose";
import { ISession } from "../interfaces/models/ISession";
import baseModelSchema from "./BaseModel";
const now = new Date();

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    browser: {
      name: { type: String, default: null },
      version: { type: String, default: null },
    },
    device: {
      type: { type: String, default: null },
      model: { type: String, default: null },
      vendor: { type: String, default: null },
    },
    os: {
      name: { type: String, default: null },
      version: { type: String, default: null },
    },
    country: { type: String, default: null },
    region: { type: String, default: null },
    city: { type: String, default: null },
    timezone: { type: String, default: null },
    ll: [
      {
        type: Number,
        default: [],
      },
    ],
    expiresAt: {
      type: Date,
      default: new Date(now.setDate(now.getDate() + 30)),
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

const sessionModel = model<ISession>("session", sessionSchema);

export default sessionModel;
