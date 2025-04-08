import mongoose, { Schema } from "mongoose";
import { DoctorScheduleStatus, IDoctorSchedule } from "../interfaces/models/IDoctorSchedule";

const DoctorScheduleSchema = new mongoose.Schema<IDoctorSchedule>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    startTime: {
      type: Date,
      required: true, 
    },
    endTime: {
      type: Date,
      required: true, 
    },
    status: {
      type: String,
      enum: DoctorScheduleStatus,
      default: DoctorScheduleStatus.AVAILABLE, 
    },
  },
  { timestamps: true }
);

const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  DoctorScheduleSchema
);

export default DoctorSchedule;
