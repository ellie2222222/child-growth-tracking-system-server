import { Request, Response, NextFunction } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/models/IQuery";
// import GrowthDataService from "../services/GrowthDataService";
import { IGrowthDataService } from "../interfaces/services/IGrowthDataService";

class GrowthDataController {
  private growthDataService: IGrowthDataService;

  constructor(growthDataService: IGrowthDataService) {
    this.growthDataService = growthDataService;
  }

  /**
   * Handles growthData creation.
   */
  createGrowthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { inputDate, height, weight, headCircumference, armCircumference } =
        req.body;
      const { childId } = req.params;
      const requesterInfo = req.userInfo;

      const growthData = await this.growthDataService.createGrowthData(
        requesterInfo,
        childId,
        {
          inputDate,
          height,
          weight,
          headCircumference,
          armCircumference,
        }
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        growthData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles updating a growthData.
   */
  updateGrowthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterInfo = req.userInfo;
      const { growthDataId } = req.params;
      const { inputDate, height, weight, headCircumference, armCircumference } =
        req.body;

      const updatedGrowthData = await this.growthDataService.updateGrowthData(
        growthDataId,
        requesterInfo,
        {
          inputDate,
          height,
          weight,
          headCircumference,
          armCircumference,
        }
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        updatedGrowthData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles deleting a growthData.
   */
  deleteGrowthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { growthDataId } = req.params;
      const requesterInfo = req.userInfo;

      await this.growthDataService.deleteGrowthData(
        growthDataId,
        requesterInfo
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a single growthData by ID.
   */
  getGrowthDataById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { growthDataId } = req.params;
      const requesterInfo = req.userInfo;

      const growthData = await this.growthDataService.getGrowthDataById(
        growthDataId,
        requesterInfo
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        growthData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a growth velocity by child ID.
   */
  generateGrowthVelocityByChildId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { childId } = req.params;
      const requesterInfo = req.userInfo;

      const growthVelocity =
        await this.growthDataService.generateGrowthVelocityByChildId(
          childId,
          requesterInfo
        );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        growthVelocity,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a list of growthData by child ID.
   */
  getGrowthDataByChildId = async (
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
        sortBy: (req.query.sortBy as "date") || "date",
        order: (req.query.order as "ascending" | "descending") || "descending",
      };

      const { growthData, page, total, totalPages } =
        await this.growthDataService.getGrowthDataByChildId(
          childId,
          requesterInfo,
          query
        );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        growthData,
        page,
        total,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  publicGenerateGrowthData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        inputDate,
        height,
        weight,
        headCircumference,
        armCircumference,
        birthDate,
        gender,
      } = req.body;

      const growthData = await this.growthDataService.publicGenerateGrowthData(
        {
          inputDate,
          height,
          weight,
          headCircumference,
          armCircumference,
        },
        birthDate,
        gender
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({
          result: growthData,
          message: "Get growth result successfully",
        });
    } catch (error) {
      next(error);
    }
  };
}

export default GrowthDataController;
