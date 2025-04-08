import { NextFunction, Request, Response } from "express";
import { IDoctorSchedule } from "../models/IDoctorSchedule";
import { IQuery } from "../models/IQuery";
import { IPagination } from "../others/IPagination";
import { ClientSession } from "mongoose";

export interface IDoctorScheduleRepository {
  createSchedule (data: Partial<IDoctorSchedule>, session?: ClientSession): Promise<void>

  getSchedule (scheduleId: string): Promise<IDoctorSchedule | null>

  getSchedulesByUserId (
    query: IQuery,
    userId: string,
  ): Promise<IPagination>

  deleteSchedule (scheduleId: string, session?: ClientSession): Promise<void>;

  updateSchedule (scheduleId: string, data: Partial<IDoctorSchedule>, session?: ClientSession): Promise<void>;

  findConflictingSchedules(
    doctorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<IDoctorSchedule[]>;
}