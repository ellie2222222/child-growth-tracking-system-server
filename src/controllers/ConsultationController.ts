import { NextFunction, Request, Response } from "express";
import ConsultationService from "../services/ConsultationService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class ConsultationController {
  private consultationService: ConsultationService;

  constructor() {
    this.consultationService = new ConsultationService();
  }

  updateConsultationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const requesterId = req.userInfo.userId;

      const consultation =
        await this.consultationService.updateConsultationStatus(
          id,
          status,
          requesterId,
          false
        );

      res.status(StatusCodeEnum.OK_200).json({
        Consultation: consultation,
        message: "Consultation status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const requesterId = req.userInfo.userId;

      const consultation = await this.consultationService.getConsultation(
        id,
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        Consultation: consultation,
        message: "Consultation retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getConsultationsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const { page, size, search, order, sortBy, status, as } = req.query;

      const formatedAs = as ? (as as "MEMBER" | "DOCTOR") : "MEMBER";

      const consultations =
        await this.consultationService.getConsultationsByUserId(
          {
            page: parseInt(page as string) || 1,
            size: parseInt(size as string) || 10,
            search: search as string,
            order: (order as "ascending" | "descending") || "ascending",
            sortBy: (sortBy as "date") || "date",
          },
          status as string,
          id,
          requesterId,
          formatedAs
        );

      res.status(StatusCodeEnum.OK_200).json({
        Consultations: consultations,
        message: "Retrieved consultations by userId successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getConsultations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterId = req.userInfo.userId;
      const { page, size, search, order, sortBy, status } = req.query;

      const consultations = await this.consultationService.getConsultations(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        status as string,
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json({
        Consultations: consultations,
        message: "Retrieved consultations successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteConsultation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const requesterId = req.userInfo.userId;

      await this.consultationService.deleteConsultation(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Deleted consultation successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ConsultationController;
