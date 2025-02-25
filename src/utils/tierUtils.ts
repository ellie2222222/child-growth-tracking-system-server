import { isValidObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { ITier } from "../interfaces/ITier";
import { IUser } from "../interfaces/IUser";
import PostRepository from "../repositories/PostRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import GrowthDataRepository from "../repositories/GrowthDataRepository";

const postRepo = new PostRepository();
const MempackRepo = new MembershipPackageRepository();
const GrowthDataRepo = new GrowthDataRepository();

const getCheckIntervalBounds = (
  current: Date,
  startDate: Date,
  checkInterval: number
): { start: Date; end: Date } => {
  const intervalsPassed = Math.floor(
    (current.getTime() - startDate.getTime()) /
      (checkInterval * 24 * 60 * 60 * 1000)
  );

  const checkIntervalStart = new Date(
    startDate.getTime() + intervalsPassed * checkInterval * 24 * 60 * 60 * 1000
  );

  const checkIntervalEnd = new Date(
    checkIntervalStart.getTime() + checkInterval * 24 * 60 * 60 * 1000
  );

  return { start: checkIntervalStart, end: checkIntervalEnd };
};

const validateUserMembership = async (
  user: IUser,
  tierData: ITier,
  usage: "POST" | "UPDATE" | "VIEW"
) => {
  let startDate, interval;

  if (user.subscription.tier !== 0) {
    const currentPlanId = user?.subscription?.currentPlan;

    if (!currentPlanId || !isValidObjectId(currentPlanId)) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "Invalid user's current membership plan"
      );
    }

    const CheckPack = await MempackRepo.getMembershipPackage(
      currentPlanId.toString(),
      true
    );

    if (!CheckPack) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "User's current membership package not found"
      );
    }

    if (!user.subscription.endDate) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "Your membership expiration date not found"
      );
    }

    const endDate = new Date(
      (user.subscription.startDate as Date).getTime() +
        3600 * 24 * CheckPack.duration.value * 1000
    );

    const timeMargin = 5 * 60 * 1000;
    if (
      Math.abs(endDate.getTime() - user.subscription.endDate?.getTime()) >
      timeMargin
    ) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "Invalid user's membership expiration date "
      );
    }

    if (user.subscription.endDate?.getTime() < Date.now()) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "Current pack has expires, please wait for the system to handle"
      );
    }

    startDate = user.subscription.startDate;
    switch (usage) {
      case "POST":
        interval = tierData.postsLimit.time;
        break;

      case "UPDATE":
        interval = tierData.updateRecordsLimit.time;
        break;

      case "VIEW":
        interval = tierData.viewRecordsLimit.time;
        break;

      default:
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Unsupported operation in validateUserMembership"
        );
        break;
    }
  } else {
    if (
      user.subscription.currentPlan ||
      user.subscription.startDate ||
      user.subscription.endDate
    ) {
      throw new CustomException(
        StatusCodeEnum.Forbidden_403,
        "Tier 0 cannot have subscription details"
      );
    }
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const firstDay = new Date(year, month, 1);

    startDate = firstDay;
    interval = 30;
  }
  return { startDate, interval };
};

const checkPostLimit = async (
  userId: string,
  start: Date,
  end: Date,
  tierData: ITier
) => {
  const PostsCount = await postRepo.countPosts(userId, start, end);

  if (PostsCount >= tierData.postsLimit.value) {
    throw new CustomException(
      StatusCodeEnum.Forbidden_403,
      "You have exceeded your current tier post limit"
    );
  }
};

const checkUpdateChildrenGrowthLimit = async (
  userId: string,
  start: Date,
  end: Date,
  tierData: ITier
) => {
  const growthDataCount = await GrowthDataRepo.countUserUpdateGrowthData(
    userId,
    start,
    end
  );

  if (growthDataCount >= tierData.updateRecordsLimit.value) {
    throw new CustomException(
      StatusCodeEnum.Forbidden_403,
      "You have exceeded your current tier update records limit"
    );
  }
};
export {
  getCheckIntervalBounds,
  validateUserMembership,
  checkPostLimit,
  checkUpdateChildrenGrowthLimit,
};
