import { NextFunction, Request, Response } from "express";
// import MembershipPackageService from "../services/MembershipPackagesService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IMembershipPackageService } from "../interfaces/services/IMembershipPackagesService";

class MembershipPackageController {
  private membershipPackageService: IMembershipPackageService;

  constructor(membershipPackageService: IMembershipPackageService) {
    this.membershipPackageService = membershipPackageService;
  }
  createMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { price, duration } = req.body;
      const { unit, name, description, postLimit, updateChildDataLimit } =
        req.body;
      const formatedPrice = {
        value: parseFloat(price as string),
        unit: unit,
      };
      price = formatedPrice;
      const formatedDuration = {
        value: parseInt(duration as string),
        unit: "DAY",
      };
      duration = formatedDuration;
      const membershipPackage =
        await this.membershipPackageService.createMembershipPackage(
          name,
          description,
          price,
          duration,
          parseInt(postLimit),
          parseInt(updateChildDataLimit)
        );
      res.status(StatusCodeEnum.Created_201).json({
        package: membershipPackage,
        message: "Membership package created successfully",
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  };

  getMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterId = req.userInfo.userId;
      const { id } = req.params;
      const membershipPackage =
        await this.membershipPackageService.getMembershipPackage(
          id,
          requesterId || ""
        );
      res.status(StatusCodeEnum.OK_200).json({
        package: membershipPackage,
        message: "Get membership package successfully",
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getMembershipPackages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterId = req.userInfo.userId;
      const { page, size, search, order, sortBy } = req.query;
      const membershipPackages =
        await this.membershipPackageService.getMembershipPackages(
          {
            page: page ? parseInt(page as string) : 1,
            size: size ? parseInt(size as string) : 10,
            search: search ? (search as string) : "",
            order: order ? (order as "ascending" | "descending") : "ascending",
            sortBy: sortBy ? (sortBy as "date") : "date",
          },
          requesterId || ""
        );
      res.status(StatusCodeEnum.OK_200).json({
        ...membershipPackages,
        message: "Get membership packages successfully",
      });
      return;
    } catch (error) {
      next(error);
    }
  };
  updateMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      let { price, duration } = req.body;
      const {
        unit,
        name,
        description,
        postLimit,
        updateChildDataLimit,
        ,
      } = req.body;

      const formatedPrice = {
        value: parseFloat(price as string),
        unit: unit,
      };
      price = formatedPrice;
      const formatedDuration = {
        value: parseInt(duration as string),
        unit: "DAY",
      };
      duration = formatedDuration;

      const membershipPackage =
        await this.membershipPackageService.updateMembershipPackage(
          id,
          name,
          description,
          price,
          duration,
          parseInt(postLimit),
          parseInt(updateChildDataLimit),
          
        );
      res.status(StatusCodeEnum.OK_200).json({
        package: membershipPackage,
        message: "Updated membership package successfully",
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  deleteMembershipPackage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const booleanResult =
        await this.membershipPackageService.deleteMembershipPackage(id);

      if (booleanResult) {
        res
          .status(StatusCodeEnum.OK_200)
          .json({ message: "Membership package deleted successfully" });
        return;
      } else {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Failed to delete package"
        );
      }
    } catch (error) {
      next(error);
    }
  };
}

export default MembershipPackageController;
