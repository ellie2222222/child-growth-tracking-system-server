import Database from "../utils/database";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IQuery } from "../interfaces/IQuery";
import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
import ChildRepository from "../repositories/ChildRepository";
import { IChild } from "../interfaces/IChild";
import mongoose from "mongoose";
import GrowthDataRepository, { GrowthData } from "../repositories/GrowthDataRepository";
import { IGrowthData } from "../interfaces/IGrowthData";

class GrowthDataService {
  private growthDataRepository: GrowthDataRepository;
  private userRepository: UserRepository;
  private childRepository: ChildRepository;
  private database: Database;

  constructor() {
    this.growthDataRepository = new GrowthDataRepository();
    this.userRepository = new UserRepository();
    this.childRepository = new ChildRepository();
    this.database = Database.getInstance();
  }

  /**
   * Create a growthData
   */
  createGrowthData = async (
    requesterInfo: Request["userInfo"],
    childId: string,
    growthData: Partial<IGrowthData>
  ): Promise<IGrowthData| null> => {
    const session = await this.database.startTransaction();
    try {
      const requesterId = requesterInfo.userId;
      const requesterRole = requesterInfo.role;
      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
      }

      let child: IChild | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          child = await this.childRepository.getChildById(childId, true);
          break;
        
        case UserEnum.MEMBER:
          child = await this.childRepository.getChildById(childId, false)
          break;
        
        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(StatusCodeEnum.NotFound_404, "Growth data not found");
      }
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found");
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

      growthData.childId = new mongoose.Types.ObjectId(childId);
      const createdGrowthData = await this.growthDataRepository.createGrowthData(growthData, session);
      
      await this.database.commitTransaction(session);
      
      return createdGrowthData;
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
   * Get a single growthData by ID
   */
  getGrowthDataById = async (
    growthDataId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IGrowthData | null> => {
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

      // Get growth data with conditions
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, true);
          break;
        
        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, false);
          break;

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Growth data not found");
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(growthData.childId.toString(), false);
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found")
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      return growthData;
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
   * Get multiple growthData for a user
   */
  getGrowthDataByChildId = async (
    childId: string,
    requesterInfo: Request["userInfo"],
    query: IQuery
  ): Promise<GrowthData> => {
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

      // Get growthData with conditions
      let growthData: GrowthData;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          growthData = await this.growthDataRepository.getGrowthDataByChildId(childId, query, true);
          break;
        
        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          growthData = await this.growthDataRepository.getGrowthDataByChildId(childId, query, false);
          break;

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Growth data not found");
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(childId.toString(), false);
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found")
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      return growthData;
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
   * Delete a growthData
   */
  deleteGrowthData = async (
    growthDataId: string,
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

      // Get growthData with conditions
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, true);
          break;
        
        case UserEnum.MEMBER:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, false);
          break;
          
        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Growth data not found");
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(growthData.childId.toString(), false);
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found")
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      const deletedGrowthData = await this.growthDataRepository.deleteGrowthData(
        growthDataId,
        session
      );
      if (!deletedGrowthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
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
   * Update a growthData's details
   */
  updateGrowthData = async (
    growthDataId: string,
    requesterInfo: Request["userInfo"],
    updateData: Partial<IGrowthData>
  ): Promise<IGrowthData | null> => {
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

      // Get growthData with conditions
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, true);
          break;
        
        case UserEnum.MEMBER:
          growthData = await this.growthDataRepository.getGrowthDataById(growthDataId, false);
          break;
          
        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Growth data not found");
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(growthData.childId.toString(), false);
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found")
      }

      // Check if user is associated with the child in relationships
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      const updatedGrowthData = await this.growthDataRepository.updateGrowthData(
        growthDataId,
        updateData,
        session
      );

      if (!updatedGrowthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found or cannot be updated"
        );
      }

      await this.database.commitTransaction(session);
      return updatedGrowthData;
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

export default GrowthDataService;
