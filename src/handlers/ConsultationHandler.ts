import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { ConsultationStatus } from "../interfaces/models/IConsultation";

class ConsultationHandler {
  getConsultation = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id as string);
    } catch {
      validationErrors.push({
        field: "id",
        error: "Invalid id",
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

  getConsultations = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { page, size, order, sortBy, status } = req.query;

    if (page && Number.isNaN(page)) {
      validationErrors.push({
        field: "Page",
        error: "Invalid page number in query",
      });
    }

    if (size && Number.isNaN(size)) {
      validationErrors.push({
        field: "Size",
        error: "Invalid size number in query",
      });
    }

    if (order && !["ascending", "descending"].includes(order as string)) {
      validationErrors.push({
        field: "Order",
        error: "Invalid order in query",
      });
    }

    if (sortBy && !["date"].includes(sortBy as string)) {
      validationErrors.push({
        field: "SortBy",
        error: "Invalid sortBy in query",
      });
    }

    if (
      status &&
      ![ConsultationStatus.ENDED, ConsultationStatus.ONGOING].includes(
        status as ConsultationStatus
      )
    ) {
      validationErrors.push({
        field: "Invalid status",
        error: "Invalid status in query",
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

  getConsultationsByUserId = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { page, size, order, sortBy, status, as } = req.query;

    try {
      validateMongooseObjectId(id as string);
    } catch {
      validationErrors.push({
        field: "Invalid userId",
        error: "Invalid userId in params",
      });
    }

    if (page && Number.isNaN(page)) {
      validationErrors.push({
        field: "Page",
        error: "Invalid page number in query",
      });
    }

    if (size && Number.isNaN(size)) {
      validationErrors.push({
        field: "Size",
        error: "Invalid size number in query",
      });
    }

    if (order && !["ascending", "descending"].includes(order as string)) {
      validationErrors.push({
        field: "Order",
        error: "Invalid order in query",
      });
    }

    if (sortBy && !["date"].includes(sortBy as string)) {
      validationErrors.push({
        field: "SortBy",
        error: "Invalid sortBy in query",
      });
    }

    if (
      status &&
      ![ConsultationStatus.ENDED, ConsultationStatus.ONGOING].includes(
        status as ConsultationStatus
      )
    ) {
      validationErrors.push({
        field: "Invalid status",
        error: "Invalid status in query",
      });
    }

    if (as && !["MEMBER", "DOCTOR"].includes(as as string)) {
      validationErrors.push({
        field: "Invalid AS position",
        error: "Invalid position as in query",
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

  updateConsultationStatus = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;
    const { status } = req.body;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "Invalid consultation ID",
        error: "Invalid consultation ID in query",
      });
    }

    if (!status) {
      validationErrors.push({
        field: "Invalid status",
        error: "Status is required",
      });
    }

    if (
      status &&
      ![ConsultationStatus.ENDED].includes(status as ConsultationStatus)
    ) {
      validationErrors.push({
        field: "Invalid status",
        error: "Invalid status in query",
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

  deleteConsultation = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "Invalid consultation ID",
        error: "Invalid consultation ID in params",
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

export default ConsultationHandler;
