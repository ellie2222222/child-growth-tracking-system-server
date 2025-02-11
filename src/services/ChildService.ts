import Database from "../utils/database";
import SessionService from "./SessionService";
import ChildRepository, { ChildrenData } from "../repositories/ChildRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IChild } from "../interfaces/IChild";
import { IQuery } from "../interfaces/IQuery";
import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
import TierRepository from "../repositories/TierRepository";
import mongoose, { ObjectId } from "mongoose";

class ChildService {
  private childRepository: ChildRepository;
  private userRepository: UserRepository;
  private database: Database;
  private tierRepository: TierRepository;

  constructor() {
    this.childRepository = new ChildRepository();
    this.userRepository = new UserRepository();
    this.database = Database.getInstance();
    this.tierRepository = new TierRepository();
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
      await this.checkTierChildrenLimit(requesterId);

      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Prepare data
      childData.relationships = [
        {
          memberId: requesterId,
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
      if (
        requesterRole === UserEnum.ADMIN ||
        requesterRole === UserEnum.SUPER_ADMIN
      ) {
        child = await this.childRepository.getChildById(childId, true);
      } else if (
        requesterRole === UserEnum.MEMBER ||
        requesterRole === UserEnum.DOCTOR
      ) {
        child = await this.childRepository.getChildById(childId, false);
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
      if (
        requesterRole === UserEnum.ADMIN ||
        requesterRole === UserEnum.SUPER_ADMIN
      ) {
        data = await this.childRepository.getChildrenByUserId(
          userId,
          query,
          true
        );
      } else if (
        requesterRole === UserEnum.MEMBER ||
        requesterRole === UserEnum.DOCTOR
      ) {
        data = await this.childRepository.getChildrenByUserId(
          userId,
          query,
          false
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
      if (
        requesterRole === UserEnum.ADMIN ||
        requesterRole === UserEnum.SUPER_ADMIN
      ) {
        child = await this.childRepository.getChildById(childId, true);
      } else if (
        requesterRole === UserEnum.MEMBER ||
        requesterRole === UserEnum.DOCTOR
      ) {
        child = await this.childRepository.getChildById(childId, false);
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
      if (
        requesterRole === UserEnum.ADMIN ||
        requesterRole === UserEnum.SUPER_ADMIN
      ) {
        child = await this.childRepository.getChildById(childId, true);
      } else if (
        requesterRole === UserEnum.MEMBER ||
        requesterRole === UserEnum.DOCTOR
      ) {
        child = await this.childRepository.getChildById(childId, false);
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

      const ChildCount = await this.childRepository.countUserChildren(
        userId as string
      );

      if (Number(ChildCount) >= Number(tierData.childrenLimit)) {
        throw new CustomException(
          StatusCodeEnum.TooManyRequests_429,
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
