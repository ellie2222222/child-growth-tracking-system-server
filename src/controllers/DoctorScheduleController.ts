import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IDoctorScheduleService } from "../interfaces/services/IDoctorScheduleService";
import { IQuery } from "../interfaces/models/IQuery";
import { IDoctorSchedule } from "../interfaces/models/IDoctorSchedule";

class DoctorScheduleController {
  private doctorScheduleService: IDoctorScheduleService;

  constructor(doctorScheduleService: IDoctorScheduleService) {
    this.doctorScheduleService = doctorScheduleService;
  }

  createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId, memberId, startTime, endTime, status } = req.body;
      const data: Partial<IDoctorSchedule> = {
        doctorId, memberId, startTime, endTime, status
      }

      await this.doctorScheduleService.createSchedule(data, req.userInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scheduleId } = req.params;

      const schedule = await this.doctorScheduleService.getSchedule(
        scheduleId,
        req.userInfo
      );

      res.status(StatusCodeEnum.OK_200).json({
        schedule,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  getSchedulesByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      const query: IQuery = {
        page: parseInt(req.query.page as string, 10) || 1,
        size: parseInt(req.query.size as string, 10) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as "date" | "name") || "date",
        order: (req.query.order as "ascending" | "descending") || "descending",
        status: req.query.status
      }

      const { data, page, totalPages, total } = await this.doctorScheduleService.getSchedulesByUserId(
        query,
        userId,
        req.userInfo
      );

      res.status(StatusCodeEnum.OK_200).json({
        schedules: data, page, totalPages, total,
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scheduleId } = req.params;

      await this.doctorScheduleService.deleteSchedule(scheduleId, req.userInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scheduleId } = req.params;
      const { startTime, endTime, status } = req.body;
      const data: Partial<IDoctorSchedule> = {
        startTime, endTime, status
      }

      await this.doctorScheduleService.updateSchedule(scheduleId, data, req.userInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default DoctorScheduleController;
