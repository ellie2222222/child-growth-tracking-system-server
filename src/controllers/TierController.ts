import { NextFunction, Request, Response } from "express";
import TierService from "../services/TierService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class TierController {
  private tierService: TierService;

  constructor() {
    this.tierService = new TierService();
  }

  createTier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        tier,
        childrenLimit,
        postsLimitValue,
        postLimitTime,
        updateRecordsLimitValue,
        updateRecordsLimitTime,
        viewRecordsLimitValue,
        viewRecordsLimitTime,
      } = req.body;

      const tierData = await this.tierService.createTier(
        tier,
        childrenLimit,
        postsLimitValue,
        postLimitTime,
        updateRecordsLimitValue,
        updateRecordsLimitTime,
        viewRecordsLimitValue,
        viewRecordsLimitTime
      );

      res
        .status(StatusCodeEnum.Created_201)
        .json({ tier: tierData, message: "Tier created successfully" });
    } catch (error) {
      next(error);
    }
  };

  updateTier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        tier,
        childrenLimit,
        postsLimitValue,
        postLimitTime,
        updateRecordsLimitValue,
        updateRecordsLimitTime,
        viewRecordsLimitValue,
        viewRecordsLimitTime,
      } = req.body;

      const tierData = await this.tierService.updateTier(
        id,
        tier,
        childrenLimit,
        postsLimitValue,
        postLimitTime,
        updateRecordsLimitValue,
        updateRecordsLimitTime,
        viewRecordsLimitValue,
        viewRecordsLimitTime
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ tier: tierData, message: "Tier updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  getTier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const tierData = await this.tierService.getTier(id, requesterId);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ tier: tierData, message: "Get tier data successfully" });
    } catch (error) {
      next(error);
    }
  };

  getTiers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy, ignoreDeleted } = req.query;
      const requesterId = req.userInfo.userId;

      const tiers = await this.tierService.getTiers(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        requesterId,
        Boolean(ignoreDeleted)
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ ...tiers, message: "Get tiers successfully" });
    } catch (error) {
      next(error);
    }
  };
}
export default TierController;
