import mongoose, { Model, Schema } from "mongoose";
import { IConsultationMessage } from "../interfaces/models/IConsultationMessage";

const ConsultationMessageSchema = new Schema<IConsultationMessage>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultationMessageModel: Model<IConsultationMessage> = mongoose.model(
  "ConsultationMessage",
  ConsultationMessageSchema
);

export default ConsultationMessageModel;
