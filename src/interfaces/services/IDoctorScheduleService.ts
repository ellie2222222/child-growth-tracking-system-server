import { Request } from "express";
import { IDoctorSchedule } from "../models/IDoctorSchedule";
import { IQuery } from "../models/IQuery";
import { IPagination } from "../others/IPagination";

export interface IDoctorScheduleService {
  createSchedule (data: Partial<IDoctorSchedule>, requesterInfo: Request["userInfo"]): Promise<void>

  getSchedule (scheduleId: string, requesterInfo: Request["userInfo"]): Promise<IDoctorSchedule | null>

  getSchedulesByUserId (
    query: IQuery,
    userId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IPagination>

  deleteSchedule (scheduleId: string, requesterInfo: Request["userInfo"]): Promise<void>;

  updateSchedule (scheduleId: string, data: Partial<IDoctorSchedule>, requesterInfo: Request["userInfo"]): Promise<void>;
}