import { NextFunction, Request, Response } from "express";
import UserRepository from "../repositories/UserRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import PostRepository from "../repositories/PostRepository";
import GrowthDataRepository from "../repositories/GrowthDataRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import { IMembershipPackage } from "../interfaces/IMembershipPackage";

const userRepository = new UserRepository();
const postRepository = new PostRepository();
const growthDataRepository = new GrowthDataRepository();
const membershipPackageRepository = new MembershipPackageRepository();

const validateMembership = (usage: "postLimit" | "updateChildDataLimit") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userInfo.userId;
    const user = await userRepository.getUserById(userId, false);
    if (!user) {
      res
        .status(StatusCodeEnum.Unauthorized_401)
        .json({ message: "Unauthorized user" });
      return;
    }

    if (user?.role === UserEnum.MEMBER) {
      if (user.subscription.currentPlan === null) {
        res
          .status(StatusCodeEnum.Forbidden_403)
          .json({ message: "This action required membership" });
        return;
      }

      if (
        user.subscription.startDate === null ||
        user.subscription.endDate === null
      ) {
        res
          .status(StatusCodeEnum.Forbidden_403)
          .json({ message: "Invalid subscription start or end date" });
        return;
      }

      const mempack = await membershipPackageRepository.getMembershipPackage(
        user.subscription.currentPlan.toString(),
        true
      );

      if (!mempack || mempack === null) {
        res
          .status(StatusCodeEnum.NotFound_404)
          .json({ message: "Current membership not found" });
        return;
      }

      switch (usage) {
        case "postLimit": {
          const posts = await postRepository.countPosts(
            user._id as string,
            user.subscription.startDate,
            user.subscription.endDate
          );
          if (posts >= (mempack as IMembershipPackage)?.postLimit) {
            res
              .status(StatusCodeEnum.BadRequest_400)
              .json({ message: "You have exceed current pack post limit" });
            return;
          }
          break;
        }
        case "updateChildDataLimit": {
          const growthDataCount =
            await growthDataRepository.countUserUpdateGrowthDataByCreatedAt(
              user._id as string,
              user.subscription.startDate,
              user.subscription.endDate
            );
          if (
            growthDataCount >=
            (mempack as IMembershipPackage)?.updateChildDataLimit
          ) {
            res.status(StatusCodeEnum.BadRequest_400).json({
              message:
                "You have exceed current pack children growth data update limit",
            });
            return;
          }
          break;
        }
        default:
          break;
      }
    }
    next();
  };
};

export default validateMembership;
