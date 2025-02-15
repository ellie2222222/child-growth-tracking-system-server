import mongoose, { Schema } from "mongoose";
import { IRequest, RequestStatus } from "../interfaces/IRequest";

const RequestSchema = new mongoose.Schema<IRequest>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    childIds: {
      type: [Schema.Types.ObjectId],
      ref: "Children",
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: RequestStatus,
      default: RequestStatus.Pending,
    },
    title: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const RequestModel = mongoose.model<IRequest>("Request", RequestSchema);

export default RequestModel;
