import { Request } from "express";
import { IDoctorScheduleService } from "../interfaces/services/IDoctorScheduleService";
import { IDoctorSchedule } from "../interfaces/models/IDoctorSchedule";
import { IPagination } from "../interfaces/others/IPagination";
import { IQuery } from "../interfaces/models/IQuery";
import Database from "../utils/database";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IDoctorScheduleRepository } from "../interfaces/repositories/IDoctorScheduleRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import moment from "moment";

class DoctorScheduleService implements IDoctorScheduleService {
  private database: Database;
  private doctorScheduleRepository: IDoctorScheduleRepository;
  private userRepository: IUserRepository;

  constructor(doctorScheduleRepository: IDoctorScheduleRepository, userRepository: IUserRepository) {
    this.doctorScheduleRepository = doctorScheduleRepository;
    this.userRepository = userRepository;
    this.database = Database.getInstance();
  }

  createSchedule = async (
    data: Partial<IDoctorSchedule>,
    requesterInfo: Request["userInfo"]
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const { doctorId, memberId, startTime, endTime } = data;
  
      // Check doctor
      const checkDoctor = await this.userRepository.getUserById(doctorId as string, false);
      if (!checkDoctor) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Doctor not found");
      }
  
      // Check member (optional)
      if (memberId) {
        const checkMember = await this.userRepository.getUserById(memberId as string, false);
        if (!checkMember) {
          throw new CustomException(StatusCodeEnum.NotFound_404, "Member not found");
        }
      }
  
      // Ensure correct dates
      const format = "MM/DD/YYYY HH:mm";
      const parsedStart = moment(startTime, format, true);
      const parsedEnd = moment(endTime, format, true);
  
      // Check for conflicting schedules
      const conflicts = await this.doctorScheduleRepository.findConflictingSchedules(
        doctorId as string,
        parsedStart.toDate(),
        parsedEnd.toDate()
      );
      if (conflicts.length > 0) {
        throw new CustomException(StatusCodeEnum.Conflict_409, "Time slot conflicts with existing schedule");
      }
  
      // All clear, create schedule
      await this.doctorScheduleRepository.createSchedule(data, session);
      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error instanceof CustomException
        ? error
        : new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Internal Server Error"
          );
    }
  };

  getSchedule = async (
    scheduleId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IDoctorSchedule | null> => {
    try {
      const schedule = await this.doctorScheduleRepository.getSchedule(scheduleId);
      if (!schedule) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Schedule not found"
        );
      }

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
  }

  getSchedulesByUserId = async (
    query: IQuery,
    userId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IPagination> => {
    try {
      const paginationData = await this.doctorScheduleRepository.getSchedulesByUserId(query, userId);
      return paginationData;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  deleteSchedule = async (
    scheduleId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const checkSchedule = await this.doctorScheduleRepository.getSchedule(scheduleId);
      if (!checkSchedule) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Schedule not found");
      }

      await this.doctorScheduleRepository.deleteSchedule(scheduleId, session);
      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error instanceof CustomException
        ? error
        : new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Internal Server Error"
          );
    }
  }

  updateSchedule = async (
    scheduleId: string,
    data: Partial<IDoctorSchedule>,
    requesterInfo: Request["userInfo"]
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const checkSchedule = await this.doctorScheduleRepository.getSchedule(scheduleId);
      if (!checkSchedule) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Schedule not found");
      }
  
      const format = "MM/DD/YYYY HH:mm";
  
      const startTimeStr = data.startTime ?? checkSchedule.startTime;
      const endTimeStr = data.endTime ?? checkSchedule.endTime;
  
      const parsedStart = moment(startTimeStr, format, true);
      const parsedEnd = moment(endTimeStr, format, true);
  
      // Check for conflicting schedules
      const conflicts = (await this.doctorScheduleRepository.findConflictingSchedules(
        checkSchedule.doctorId as string,
        parsedStart.toDate(),
        parsedEnd.toDate()
      )).filter(schedule => schedule._id?.toString() !== scheduleId?.toString());
  
      if (conflicts.length > 0) {
        throw new CustomException(StatusCodeEnum.Conflict_409, "Time slot conflicts with existing schedule");
      }
  
      // All clear, update schedule
      await this.doctorScheduleRepository.updateSchedule(scheduleId, data, session);
      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error instanceof CustomException
        ? error
        : new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Internal Server Error"
          );
    }
  };  
}

export default DoctorScheduleService;
