import { NextFunction, Request, Response } from "express";
import ConsultationMessageService from "../services/ConsultationMessageService";
import { cleanUpFileArray, formatPathArray } from "../utils/fileUtils";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class ConsultationMessageController {
  private consultationMessageService: ConsultationMessageService;

  constructor() {
    this.consultationMessageService = new ConsultationMessageService();
  }

  createConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const files = (req.files as Express.Multer.File[]) || [];
    try {
      const requesterId = req.userInfo.userId;
      const { consultationId, message } = req.body;

      let attachments: string[] = [];
      if (files && files.length > 0) attachments = formatPathArray(files);

      const ConsultationMessage =
        await this.consultationMessageService.createConsultationMessage(
          consultationId,
          requesterId,
          message,
          attachments as [string]
        );

      res.status(StatusCodeEnum.Created_201).json({
        ConsultationMessage: ConsultationMessage,
        Message: "Consultation message created successfully",
      });
    } catch (error) {
      if (files && files.length > 0) {
        const attachments = formatPathArray(files);
        cleanUpFileArray(attachments, "create");
      }
      next(error);
    }
  };

  getConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const message =
        await this.consultationMessageService.getConsultationMessage(
          id,
          requesterId
        );

      res.status(StatusCodeEnum.OK_200).json({
        ConsultationMessage: message,
        Message: "Get consultation message successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getConsultationMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { page, size, search, order, sortBy } = req.query;
      const requesterId = req.userInfo.userId;

      const messages =
        await this.consultationMessageService.getConsultationMessages(
          id,
          {
            page: parseInt(page as string) || 1,
            size: parseInt(size as string) || 10,
            search: search as string,
            order: (order as "ascending" | "descending") || "ascending",
            sortBy: (sortBy as "date") || "date",
          },
          requesterId
        );
      res.status(StatusCodeEnum.OK_200).json({
        ...messages,
        Message: "Get consultation messages by consultationId successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const files = (req.files as Express.Multer.File[]) || [];
    try {
      const requesterId = req.userInfo.userId;

      const { id } = req.params;
      const { message } = req.body;

      let attachments: string[] = [];
      if (files && files.length > 0) attachments = formatPathArray(files);

      const updatedMessage =
        await this.consultationMessageService.updateConsultationMessage(
          id,
          requesterId,
          message,
          attachments as [string]
        );

      res.status(StatusCodeEnum.OK_200).json({
        ConsultationMessage: updatedMessage,
        message: "Consultation message updated successfully",
      });
    } catch (error) {
      if (files && files.length > 0) {
        const attachments = formatPathArray(files);
        cleanUpFileArray(attachments, "create");
      }
      next(error);
    }
  };

  deleteConsultationMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      await this.consultationMessageService.deleteConsultationMessage(
        id,
        requesterId
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ Message: "consultation message deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default ConsultationMessageController;
