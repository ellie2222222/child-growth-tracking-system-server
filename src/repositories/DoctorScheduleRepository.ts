import { IDoctorSchedule } from "../interfaces/models/IDoctorSchedule";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/models/IQuery";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IDoctorScheduleRepository } from "../interfaces/repositories/IDoctorScheduleRepository";
import { ClientSession } from "mongoose";
import DoctorSchedule from "../models/DoctorScheduleModel";

class DoctorScheduleRepository implements IDoctorScheduleRepository {
  createSchedule = async (
    data: IDoctorSchedule,
    session?: ClientSession
  ): Promise<void> => {
    try {
      await DoctorSchedule.create([data], { session });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getSchedule = async (scheduleId: string): Promise<IDoctorSchedule | null> => {
    try {
      const schedule = await DoctorSchedule.findById(scheduleId);
      return schedule;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getSchedulesByUserId = async (
    query: IQuery,
    userId: string
  ): Promise<IPagination> => {
    try {
      const { order = "descending", sortBy = "createdAt", page = 1, size = 10 } = query;
  
      // Sort
      const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;

      // Pagination
      const skip = (page - 1) * size;
  
      // Filter
      const filter: any = {
        doctorId: userId
      };
  
      const data = await DoctorSchedule.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(size);
  
      const totalSchedules = await DoctorSchedule.countDocuments(filter);
  
      return {
        data,
        totalPages: Math.ceil(totalSchedules / size),
        page,
        total: totalSchedules,
      };
    } catch (error) {
      throw error instanceof CustomException
        ? error
        : new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Internal Server Error"
          );
    }
  };  

  findConflictingSchedules = async (
    doctorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<IDoctorSchedule[]> => {
    try {
      return DoctorSchedule.find({
        doctorId,
        startTime: { $lte: endTime },
        endTime: { $gte: startTime },
      });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  deleteSchedule = async (
    scheduleId: string,
    session?: ClientSession
  ): Promise<void> => {
    try {
      await DoctorSchedule.findByIdAndDelete(scheduleId, { session });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  updateSchedule = async (
    scheduleId: string,
    data: Partial<IDoctorSchedule>,
    session?: ClientSession
  ): Promise<void> => {
    try {
      await DoctorSchedule.findByIdAndUpdate(scheduleId, data, { session });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default DoctorScheduleRepository;
