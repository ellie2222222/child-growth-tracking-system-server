import mongoose, { Schema } from "mongoose";
import { ConsultationStatus, IConsultation } from "../interfaces/models/IConsultation";

const ConsultationSchema = new mongoose.Schema<IConsultation>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "Request",
    },
    status: {
      type: String,
      enum: ConsultationStatus,
      default: ConsultationStatus.ONGOING,
    },
    rating: {
      type: Number,
      default: 0,
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
