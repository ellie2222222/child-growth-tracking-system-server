import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";
import { DoctorScheduleStatus } from "../interfaces/models/IDoctorSchedule";
import moment from "moment";

class DoctorScheduleHandler {
  getSchedulesByUserId = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = req.params;
    const { page, size, order, sortBy } = req.query;

    const validationErrors: { field: string; error: string }[] = [];

    if (!validateMongooseObjectId(userId)) {
      validationErrors.push({
        field: "userId",
        error: "Invalid user ID",
      });
    }

    const validSortBy = ["date"];
    if (sortBy && !validSortBy.includes(sortBy as string)) {
      validationErrors.push({
        field: "sortBy",
        error: `Sort by must be one of: ${validSortBy.join(", ")}`,
      });
    }

    
    const validOrder = ["ascending", "descending"];
    if (order && !validOrder.includes(order as string)) {
      validationErrors.push({
        field: "order",
        error: `Order must be one of: ${validOrder.join(", ")}`,
      });
    }

    
    const parsedPage = parseInt(page as string, 10);
    if (page && (!Number.isInteger(parsedPage) || parsedPage < 1)) {
      validationErrors.push({
        field: "page",
        error: "Page must be an integer greater than or equal to 1",
      });
    }

    
    const parsedSize = parseInt(size as string, 10);
    if (size && (!Number.isInteger(parsedSize) || parsedSize < 1)) {
      validationErrors.push({
        field: "size",
        error: "Size must be an integer greater than or equal to 1",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      req.query.sortBy = sortBy || "date";
      req.query.order = order || "descending";
      req.query.page = page ? parsedPage.toString() : "1";
      req.query.size = size ? parsedSize.toString() : "10";

      next();
    }
  };

  getSchedule = (req: Request, res: Response, next: NextFunction) => {
    const { scheduleId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    if (!validateMongooseObjectId(scheduleId)) {
      validationErrors.push({
        field: "scheduleId",
        error: "Invalid schedule ID",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const { doctorId, memberId, startTime, endTime, status } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    if (req.body.memberId === null || req.body.memberId === undefined || req.body.memberId === "") {
        delete req.body.memberId;
    }      

    if (!validateMongooseObjectId(doctorId)) {
      validationErrors.push({
        field: "doctorId",
        error: "Invalid doctor ID",
      });
    }

    if (memberId && !validateMongooseObjectId(memberId)) {
      validationErrors.push({
        field: "memberId",
        error: "Invalid member ID",
      });
    }

    const format = "MM/DD/YYYY HH:mm";
    const parsedStart = moment(startTime, format, true);
    const parsedEnd = moment(endTime, format, true);

    if (!parsedStart.isValid()) {
      validationErrors.push({
        field: "startTime",
        error: `Start time must be in the format ${format}`,
      });
    } else if (parsedStart.isBefore(moment())) {
      validationErrors.push({
        field: "startTime",
        error: "Start time must be in the future or present",
      });
    }

    if (!parsedEnd.isValid()) {
      validationErrors.push({
        field: "endTime",
        error: `End time must be in the format ${format}`,
      });
    } else if (parsedEnd.isBefore(moment())) {
      validationErrors.push({
        field: "endTime",
        error: "End time must be in the future or present",
      });
    } else if (parsedEnd.isSameOrBefore(parsedStart)) {
      validationErrors.push({
        field: "endTime",
        error: "End time must be after start time",
      });
    }

    if (status && !Object.values(DoctorScheduleStatus).includes(status)) {
      validationErrors.push({
        field: "status",
        error: `Status must be one of: ${Object.values(
          DoctorScheduleStatus
        ).join(", ")}`,
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  deleteSchedule = (req: Request, res: Response, next: NextFunction) => {
    const { scheduleId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    if (!validateMongooseObjectId(scheduleId)) {
      validationErrors.push({
        field: "scheduleId",
        error: "Invalid schedule ID",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };

  updateSchedule = (req: Request, res: Response, next: NextFunction) => {
    const { scheduleId } = req.params;
    const { startTime, endTime, status } = req.body;

    const validationErrors: { field: string; error: string }[] = [];


    if (!validateMongooseObjectId(scheduleId)) {
      validationErrors.push({
        field: "scheduleId",
        error: "Invalid schedule ID",
      });
    }

    const format = "MM/DD/YYYY HH:mm";
    const parsedStart = moment(startTime, format, true);
    const parsedEnd = moment(endTime, format, true);

    if (startTime && !parsedStart.isValid()) {
      validationErrors.push({
        field: "startTime",
        error: `Start time must be in the format ${format}`,
      });
    } else if (startTime && parsedStart.isBefore(moment())) {
      validationErrors.push({
        field: "startTime",
        error: "Start time must be in the future or present",
      });
    }

    if (endTime && !parsedEnd.isValid()) {
      validationErrors.push({
        field: "endTime",
        error: `End time must be in the format ${format}`,
      });
    } else if (endTime && parsedEnd.isBefore(moment())) {
      validationErrors.push({
        field: "endTime",
        error: "End time must be in the future or present",
      });
    } else if (startTime && endTime && parsedEnd.isSameOrBefore(parsedStart)) {
      validationErrors.push({
        field: "endTime",
        error: "End time must be after start time",
      });
    }

    if (status && !Object.values(DoctorScheduleStatus).includes(status)) {
      validationErrors.push({
        field: "status",
        error: `Status must be one of: ${Object.values(
          DoctorScheduleStatus
        ).join(", ")}`,
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };
}

export default DoctorScheduleHandler;
