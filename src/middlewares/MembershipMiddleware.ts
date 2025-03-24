import { NextFunction, Request, Response } from "express";
import UserRepository from "../repositories/UserRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import PostRepository from "../repositories/PostRepository";
import GrowthDataRepository from "../repositories/GrowthDataRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import { IMembershipPackage } from "../interfaces/IMembershipPackage";
import getLogger from "../utils/logger";
import CustomException from "../exceptions/CustomException";

const userRepository = new UserRepository();
const postRepository = new PostRepository();
const growthDataRepository = new GrowthDataRepository();
const membershipPackageRepository = new MembershipPackageRepository();
const logger = getLogger("MEMBERSHIP_MIDDLEWARE");

const validateMembership = (usage: "postLimit" | "updateChildDataLimit") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userInfo.userId;

    if (!userId) {
      res
        .status(StatusCodeEnum.Unauthorized_401)
        .json({ message: "Unauthorized user" });
      return;
    }

    const user = await userRepository.getUserById(userId, false);
    if (!user) {
      res
        .status(StatusCodeEnum.NotFound_404)
        .json({ message: "User not found" });
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
          try {
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
          } catch (error) {
            res
              .status(500)
              .json({ message: (error as Error | CustomException).message });
            return;
          }
          break;
        }
        case "updateChildDataLimit": {
          try {
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
          } catch (error) {
            res
              .status(500)
              .json({ message: (error as Error | CustomException).message });
            return;
          }
          break;
        }
        default:
          res.status(StatusCodeEnum.BadRequest_400).json({
            message: "Unsupported case",
          });
          return;
      }
    } else {
      logger.info("Not member role, no membership validation required");
    }
    next();
  };
};

export default validateMembership;
