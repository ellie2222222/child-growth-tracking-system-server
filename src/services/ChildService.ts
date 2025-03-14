import Database from "../utils/database";
import { ChildrenData } from "../repositories/ChildRepository";
// import ChildRepository from "../repositories/ChildRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IChild } from "../interfaces/IChild";
import { IQuery } from "../interfaces/IQuery";
// import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
import mongoose from "mongoose";
// import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import { IChildService } from "../interfaces/services/IChildService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IChildRepository } from "../interfaces/repositories/IChildRepository";
import { IMembershipPackageRepository } from "../interfaces/repositories/IMembershipPackageRepository";

class ChildService implements IChildService {
  private childRepository: IChildRepository;
  private userRepository: IUserRepository;
  private membershipPackageRepository: IMembershipPackageRepository;
  private database: Database;

  constructor(
    childRepository: IChildRepository,
    userRepository: IUserRepository,
    membershipPackageRepository: IMembershipPackageRepository
  ) {
    this.childRepository = childRepository;
    this.userRepository = userRepository;
    this.database = Database.getInstance();
    this.membershipPackageRepository = membershipPackageRepository;
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

      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      switch (requesterRole) {
        case UserEnum.ADMIN:
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
}

export default ChildService;
