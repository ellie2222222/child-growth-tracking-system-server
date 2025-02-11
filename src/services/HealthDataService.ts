import Database from "../utils/database";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IHealthData } from "../interfaces/IHealthData";
import { IQuery } from "../interfaces/IQuery";
import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
import ChildRepository from "../repositories/ChildRepository";
import { IChild } from "../interfaces/IChild";
import mongoose from "mongoose";
import HealthDataRepository, { HealthData } from "../repositories/HealthDataRepository";

class HealthDataService {
  private healthDataRepository: HealthDataRepository;
  private userRepository: UserRepository;
  private childRepository: ChildRepository;
  private database: Database;

  constructor() {
    this.healthDataRepository = new HealthDataRepository();
    this.userRepository = new UserRepository();
    this.childRepository = new ChildRepository();
    this.database = Database.getInstance();
  }

  /**
   * Create a healthData
   */
  createHealthData = async (
    requesterInfo: Request["userInfo"],
    childId: string,
    healthData: Partial<IHealthData>
  ): Promise<IHealthData| null> => {
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
          throw new CustomException(StatusCodeEnum.NotFound_404, "Health data not found");
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

      healthData.childId = new mongoose.Types.ObjectId(childId);
      const createdHealthData = await this.healthDataRepository.createHealthData(healthData, session);
      
      await this.database.commitTransaction(session);
      
      return createdHealthData;
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
   * Get a single healthData by ID
   */
  getHealthDataById = async (
    healthDataId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<IHealthData | null> => {
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

      // Get health data with conditions
      let healthData: IHealthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, true);
          break;
        
        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, false);
          break;

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Health data not found");
      }
      if (!healthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Health data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(healthData.childId.toString(), false);
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
          "Health data not found"
        );
      }

      return healthData;
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
   * Get multiple healthData for a user
   */
  getHealthDataByChildId = async (
    childId: string,
    requesterInfo: Request["userInfo"],
    query: IQuery
  ): Promise<HealthData> => {
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

      // Get healthData with conditions
      let healthData: HealthData;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          healthData = await this.healthDataRepository.getHealthDataByChildId(childId, query, true);
          break;
        
        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          healthData = await this.healthDataRepository.getHealthDataByChildId(childId, query, false);
          break;

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Health data not found");
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
          "Health data not found"
        );
      }

      return healthData;
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
   * Delete a healthData
   */
  deleteHealthData = async (
    healthDataId: string,
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

      // Get healthData with conditions
      let healthData: IHealthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, true);
          break;
        
        case UserEnum.MEMBER:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, false);
          break;
          
        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Health data not found");
      }
      if (!healthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Health data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(healthData.childId.toString(), false);
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
          "Health data not found"
        );
      }

      const deletedHealthData = await this.healthDataRepository.deleteHealthData(
        healthDataId,
        session
      );
      if (!deletedHealthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Health data not found"
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
   * Update a healthData's details
   */
  updateHealthData = async (
    healthDataId: string,
    requesterInfo: Request["userInfo"],
    updateData: Partial<IHealthData>
  ): Promise<IHealthData | null> => {
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

      // Get healthData with conditions
      let healthData: IHealthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
        case UserEnum.SUPER_ADMIN:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, true);
          break;
        
        case UserEnum.MEMBER:
          healthData = await this.healthDataRepository.getHealthDataById(healthDataId, false);
          break;
          
        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default: 
          throw new CustomException(StatusCodeEnum.NotFound_404, "Health data not found");
      }
      if (!healthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Health data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(healthData.childId.toString(), false);
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
          "Health data not found"
        );
      }

      const updatedHealthData = await this.healthDataRepository.updateHealthData(
        healthDataId,
        updateData,
        session
      );

      if (!updatedHealthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Health data not found or cannot be updated"
        );
      }

      await this.database.commitTransaction(session);
      return updatedHealthData;
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

export default HealthDataService;
