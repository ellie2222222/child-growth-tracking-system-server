import { NextFunction, Request, Response } from "express";
// import StatisticService from "../services/StatisticService";
import { IStatisticService } from "../interfaces/services/IStatisticService";

class StatisticController {
  private statisticService: IStatisticService;

  constructor(statisticService: IStatisticService) {
    this.statisticService = statisticService;
  }

  getRevenue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { time, unit, value } = req.query;

      const revenue = await this.statisticService.getRevenue(
        time as string,
        unit as string,
        parseInt(value as string)
      );

      res.status(200).json({
        Unit: unit,
        Revenue: revenue,
        message: "Get revenue successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default StatisticController;
