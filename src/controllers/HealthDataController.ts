import { Request, Response, NextFunction } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/IQuery";
import HealthDataService from "../services/HealthDataService";

class HealthDataController {
  private healthDataService: HealthDataService;

  constructor() {
    this.healthDataService = new HealthDataService();
  }

  /**
   * Handles healthData creation.
   */
  createHealthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { inputDate, height, weight, headCircumference, armCircumference } = req.body;
      const { childId } = req.params;
      const requesterInfo = req.userInfo;

      const healthData = await this.healthDataService.createHealthData(requesterInfo, childId, {
        inputDate, height, weight, headCircumference, armCircumference
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        healthData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles updating a healthData.
   */
  updateHealthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterInfo = req.userInfo;
      const { healthDataId } = req.params;
      const { inputDate, height, weight, headCircumference, armCircumference } = req.body;

      const updatedHealthData = await this.healthDataService.updateHealthData(healthDataId, requesterInfo, {
        inputDate, height, weight, headCircumference, armCircumference
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        updatedHealthData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles deleting a healthData.
   */
  deleteHealthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { healthDataId } = req.params;
      const requesterInfo = req.userInfo;

      await this.healthDataService.deleteHealthData(healthDataId, requesterInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a single healthData by ID.
   */
  getHealthDataById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { healthDataId } = req.params;
      const requesterInfo = req.userInfo;

      const healthData = await this.healthDataService.getHealthDataById(healthDataId, requesterInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        healthData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a list of healthData for a specific user.
   */
  getHealthDataByChildId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { childId } = req.params;
      const requesterInfo = req.userInfo;
      const query: IQuery = {
        page: parseInt(req.query.page as string, 10) || 1,
        size: parseInt(req.query.size as string, 10) || 10,
        search: req.query.search as string || "",
        sortBy: (req.query.sortBy as "date" | "name") || "date",
        order: (req.query.order as "ascending" | "descending") || "descending",
      };
      
      const { healthData, page, total, totalPages } = await this.healthDataService.getHealthDataByChildId(childId, requesterInfo, query);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        healthData,
        page,
        total,
        totalPages
      });
    } catch (error) {
      next(error); 
    }
  };
}

export default HealthDataController;