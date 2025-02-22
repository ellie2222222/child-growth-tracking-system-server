import { NextFunction, Request, Response } from "express";
import RequestService from "../services/RequestService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class RequestController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { childIds, doctorId, title } = req.body;
      const userId = req.userInfo.userId;

      const request = await this.requestService.createRequest(
        childIds,
        doctorId,
        title,
        userId
      );

      res
        .status(StatusCodeEnum.Created_201)
        .json({ Request: request, message: "Request has been created" });
    } catch (error) {
      next(error);
    }
  };

  getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const request = await this.requestService.getRequest(id, requesterId);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ request: request, message: "Get request successfully" });
    } catch (error) {
      next(error);
    }
  };

  getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy, status } = req.query;

      const request = await this.requestService.getAllRequests(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        status as string
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ request: request, message: "Get all request successfully" });
    } catch (error) {
      next(error);
    }
  };

  getRequestsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const { page, size, search, order, sortBy, status, as } = req.query;

      const formatedAs = as ? (as as "MEMBER" | "DOCTOR") : "MEMBER";

      const requests = await this.requestService.getRequestsByUserId(
        id,
        requesterId,
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        status as string,
        formatedAs
      );

      res.status(StatusCodeEnum.OK_200).json({
        requests: requests,
        message: "Get request by user id successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequestStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const { status } = req.body;
      const request = await this.requestService.updateRequestStatus(
        id,
        requesterId,
        status
      );

      res.status(StatusCodeEnum.OK_200).json({
        request: request,
        message: "Update request status successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const request = await this.requestService.deleteRequest(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        request: request,
        message: "Delete request successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RequestController;
