import { Request, Response, NextFunction } from "express";
import GrowthMetricsService from "../services/GrowthMetricsService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class GrowthMetricsController {
  private growthMetricsService: GrowthMetricsService;

  constructor() {
    this.growthMetricsService = new GrowthMetricsService();
  }

  uploadGrowthMetricsFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { metric } = req.body;
      const { excelJsonData } = req;

      const { result, insertedCount, updatedCount } = await this.growthMetricsService.uploadGrowthMetricsFile(metric, excelJsonData);

      res.status(StatusCodeEnum.Created_201).json({
        message: "Success",
        result, 
        insertedCount, 
        updatedCount
      });
    } catch (error) {
      next(error);
    }
  };
}

export default GrowthMetricsController;
