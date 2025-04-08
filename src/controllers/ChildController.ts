import { Request, Response, NextFunction } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IQuery } from "../interfaces/models/IQuery";
import { IChildService } from "../interfaces/services/IChildService";

class ChildController {
  private childService: IChildService;

  constructor(childService: IChildService) {
    this.childService = childService;
  }

  /**
   * Handles child creation.
   */
  createChild = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, gender, relationship, birthDate, note, allergies, feedingType } = req.body;
      const userInfo = req.userInfo;
      const child = await this.childService.createChild(userInfo, {
        name,
        gender,
        relationship,
        birthDate,
        note,
        allergies, 
        feedingType
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Child created successfully",
        child,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles updating a child.
   */
  updateChild = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterInfo = req.userInfo;
      const { childId } = req.params;
      const { name, gender, relationship, birthDate, note, allergies, feedingType } = req.body;

      const updatedChild = await this.childService.updateChild(
        childId,
        requesterInfo,
        {
          name,
          gender,
          relationship,
          birthDate,
          note,
          allergies, 
          feedingType
        }
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Child updated successfully",
        updatedChild,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles deleting a child.
   */
  deleteChild = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { childId } = req.params;
      const requesterInfo = req.userInfo;

      await this.childService.deleteChild(childId, requesterInfo);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Child deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a single child by ID.
   */
  getChildById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { childId } = req.params;
      const requesterInfo = req.userInfo;

      const child = await this.childService.getChildById(
        childId,
        requesterInfo
      );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Child retrieved successfully",
        child,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles retrieving a list of children for a specific user.
   */
  getChildrenByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.userInfo;
      const requesterInfo = req.userInfo;
      const query: IQuery = {
        page: parseInt(req.query.page as string, 10) || 1,
        size: parseInt(req.query.size as string, 10) || 10,
        search: (req.query.search as string) || "",
        sortBy: (req.query.sortBy as "date" | "name") || "date",
        order: (req.query.order as "ascending" | "descending") || "descending",
      };

      const { children, page, total, totalPages } =
        await this.childService.getChildrenByUserId(
          userId,
          requesterInfo,
          query
        );

      res.status(StatusCodeEnum.OK_200).json({
        message: "Children retrieved successfully",
        children,
        page,
        total,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ChildController;
