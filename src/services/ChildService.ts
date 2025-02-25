import Database from "../utils/database";
import ChildRepository, { ChildrenData } from "../repositories/ChildRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IChild } from "../interfaces/IChild";
import { IQuery } from "../interfaces/IQuery";
import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
import TierRepository from "../repositories/TierRepository";
import mongoose, { isValidObjectId, ObjectId, Types } from "mongoose";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";

class ChildService {
  private childRepository: ChildRepository;
  private userRepository: UserRepository;
  private database: Database;
  private tierRepository: TierRepository;
  private membershipPackageRepository: MembershipPackageRepository;

  constructor() {
    this.childRepository = new ChildRepository();
    this.userRepository = new UserRepository();
    this.database = Database.getInstance();
    this.tierRepository = new TierRepository();
    this.membershipPackageRepository = new MembershipPackageRepository();
  }

  /**
   * Create a child
   */
  createChild = async (
    requesterInfo: Request["userInfo"],
    childData: Partial<IChild>
  ): Promise<IChild> => {
    const session = await this.database.startTransaction();
    try {
      const requesterId = requesterInfo.userId;
      const requesterRole = requesterInfo.role;
      await this.checkTierChildrenLimit(requesterId);

      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
        case UserEnum.MEMBER:
          break;

        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }

      // Prepare data
      childData.relationships = [
        {
          memberId: new mongoose.Types.ObjectId(requesterId),
          type: childData.relationship!,
        },
      ];

      const createdChild = await this.childRepository.createChild(
        childData,
        session
      );

      await this.database.commitTransaction(session);

      return createdChild;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Get a single child by ID
   */
  getChildById = async (
    childId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IChild | null> => {
    try {
      const requesterId = requesterInfo.userId;
      const requesterRole = requesterInfo.role;

      // Check user existence
      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Get child with conditions
      let child: IChild | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          child = await this.childRepository.getChildById(childId, true);
          break;

        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          child = await this.childRepository.getChildById(childId, false);
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Child not found"
          );
      }
      if (!child) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      return child;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Get multiple children for a user
   */
  getChildrenByUserId = async (
    userId: string,
    requesterInfo: Request["userInfo"],
    query: IQuery
  ): Promise<ChildrenData> => {
    try {
      const requesterRole = requesterInfo.role;
      const user = await this.userRepository.getUserById(userId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Get child with conditions
      let data: ChildrenData;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          data = await this.childRepository.getChildrenByUserId(
            userId,
            query,
            true
          );
          break;

        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          data = await this.childRepository.getChildrenByUserId(
            userId,
            query,
            false
          );
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Child not found"
          );
      }

      return data!;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Delete a child
   */
  deleteChild = async (
    childId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const requesterId = requesterInfo.userId;
      const requesterRole = requesterInfo.role;
      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Get child with conditions
      let child: IChild | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          child = await this.childRepository.getChildById(childId, true);
          break;

        case UserEnum.MEMBER:
          child = await this.childRepository.getChildById(childId, false);
          break;

        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }
      if (!child) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (
        !isRelated &&
        (requesterRole === UserEnum.DOCTOR || requesterRole === UserEnum.MEMBER)
      ) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      const deletedChild = await this.childRepository.deleteChild(
        childId,
        session
      );
      if (!deletedChild) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Update a child's details
   */
  updateChild = async (
    childId: string,
    requesterInfo: Request["userInfo"],
    updateData: Partial<IChild>
  ): Promise<IChild | null> => {
    const session = await this.database.startTransaction();
    try {
      const requesterId = requesterInfo.userId;
      const requesterRole = requesterInfo.role;
      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Get child with conditions
      let child: IChild | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          child = await this.childRepository.getChildById(childId, true);
          break;

        case UserEnum.MEMBER:
          child = await this.childRepository.getChildById(childId, false);
          break;

        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");
      }
      if (!child) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (
        !isRelated &&
        (requesterRole === UserEnum.DOCTOR || requesterRole === UserEnum.MEMBER)
      ) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

      const updatedChild = await this.childRepository.updateChild(
        childId,
        updateData,
        session
      );

      if (!updatedChild) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found or cannot be updated"
        );
      }

      await this.database.commitTransaction(session);
      return updatedChild;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  checkTierChildrenLimit = async (userId: string | ObjectId) => {
    try {
      const user = await this.userRepository.getUserById(
        userId as string,
        false
      );

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const tierData = await this.tierRepository.getCurrentTierData(
        user.subscription.tier as number
      );

      if (user.subscription.tier !== 0) {
        const currentPlanId = user?.subscription?.currentPlan;

        if (!currentPlanId || !isValidObjectId(currentPlanId)) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Invalid user's current membership plan"
          );
        }

        //else {
        //console.log("currentPlan not null");
        //}

        const CheckPack =
          await this.membershipPackageRepository.getMembershipPackage(
            currentPlanId.toString(),
            false
          );

        if (!CheckPack) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "User's current membership package not found"
          );
        }

        //else {
        //   console.log("currentPlan found");
        // }
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

        //  else {
        //   console.log("valid end date");
        // }

        //cron job late?(run each mins so late seconds?)
        if (user.subscription.endDate?.getTime() < Date.now()) {
          throw new CustomException(
            StatusCodeEnum.Forbidden_403,
            "Current pack has expires, please wait for the system to handle"
          );
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
      }

      const ChildCount = await this.childRepository.countUserChildren(
        userId as string
      );

      if (Number(ChildCount) >= Number(tierData.childrenLimit)) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You have exceeded your current tier children limit"
        );
      }
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default ChildService;
