import { IBaseEntity } from "../../models/BaseModel";
import mongoose, { ObjectId } from "mongoose";

export enum DoctorScheduleStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IDoctorSchedule extends IBaseEntity {
  doctorId: mongoose.Types.ObjectId | string;
  memberId: mongoose.Types.ObjectId | string;
  startTime: Date;
  endTime: Date;
  status: DoctorScheduleStatus;
}
