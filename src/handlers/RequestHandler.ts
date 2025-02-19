import { NextFunction, Request, Response } from "express";
import { validateMongooseObjectId } from "../utils/validator";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { ObjectId } from "mongoose";
import validator from "validator";
import { RequestStatus } from "../interfaces/IRequest";

class RequestHandler {
  createRequest = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { childIds, doctorId, title } = req.body;

    childIds.forEach((childId: string | ObjectId) => {
      try {
        validateMongooseObjectId(childId as string);
      } catch {
        validationErrors.push({
          field: "childIds",
          error: "Invalid childIds",
        });
      }
    });

    try {
      validateMongooseObjectId(doctorId as string);
    } catch {
      validationErrors.push({
        field: "doctorId",
        error: "Invalid doctorId",
      });
    }

    if (!title || !validator.isLength(title, { min: 6, max: 100 })) {
      validationErrors.push({
        field: "title",
        error: "Invalid title",
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

  getRequest = (req: Request, res: Response, next: NextFunction): void => {
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

  getAllRequests = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { page, size, order, sortBy, status } = req.params;

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
      ![
        RequestStatus.Accepted,
        RequestStatus.Canceled,
        RequestStatus.Pending,
        RequestStatus.Rejected,
      ].includes(status as RequestStatus)
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

  getRequestsByUserId = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { userId } = req.params;
    const { page, size, order, sortBy, status, as } = req.query;

    try {
      validateMongooseObjectId(userId as string);
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
      ![
        RequestStatus.Accepted,
        RequestStatus.Canceled,
        RequestStatus.Pending,
        RequestStatus.Rejected,
      ].includes(status as RequestStatus)
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

  updateRequestStatus = (
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
        field: "Invalid request ID",
        error: "Invalid request ID in query",
      });
    }

    if (
      status &&
      ![
        RequestStatus.Accepted,
        RequestStatus.Canceled,
        RequestStatus.Pending,
        RequestStatus.Rejected,
      ].includes(status as RequestStatus)
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

  deleteRequest = (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: { field: string; error: string }[] = [];

    const { id } = req.params;

    try {
      validateMongooseObjectId(id);
    } catch {
      validationErrors.push({
        field: "Invalid request ID",
        error: "Invalid request ID in query",
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

export default RequestHandler;
