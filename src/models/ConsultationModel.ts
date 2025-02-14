import mongoose, { Schema } from "mongoose";
import { ConsultationStatus, IConsultation } from "../interfaces/IConsultation";

const ConsultationSchema = new mongoose.Schema<IConsultation>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
    },
    status: {
      type: String,
      enum: ConsultationStatus,
    },
    userFeedback: {
      type: String,
      default: "",
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

const ConsultationModel = mongoose.model<IConsultation>(
  "Consultation",
  ConsultationSchema
);

export default ConsultationModel;
