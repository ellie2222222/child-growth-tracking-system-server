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
import GrowthDataRepository, {
  GrowthData,
} from "../repositories/GrowthDataRepository";
import { IGrowthData } from "../interfaces/IGrowthData";
import ConfigRepository from "../repositories/ConfigRepository";
import GrowthMetricsRepository from "../repositories/GrowthMetricsRepository";
import { IGrowthMetricForAge } from "../interfaces/IGrowthMetricForAge";
import { IGrowthResult } from "../interfaces/IGrowthResult";
import { BmiLevelEnum, LevelEnum } from "../enums/LevelEnum";

class GrowthDataService {
  private growthDataRepository: GrowthDataRepository;
  private userRepository: UserRepository;
  private childRepository: ChildRepository;
  private configRepository: ConfigRepository;
  private growthMetricsRepository: GrowthMetricsRepository;
  private database: Database;

  constructor() {
    this.growthDataRepository = new GrowthDataRepository();
    this.userRepository = new UserRepository();
    this.childRepository = new ChildRepository();
    this.growthMetricsRepository = new GrowthMetricsRepository();
    this.configRepository = new ConfigRepository();
    this.database = Database.getInstance();
  }

  private getPercentile(
    measurement: number,
    percentiles: Array<{ percentile: number; value: number }>
  ): number {
    // If the measurement is below or equal to the lowest recorded value,
    // return the lowest percentile.
    if (measurement <= percentiles[0].value) return percentiles[0].percentile;

    // If the measurement is above or equal to the highest recorded value,
    // return the highest percentile.
    if (measurement >= percentiles[percentiles.length - 1].value)
      return percentiles[percentiles.length - 1].percentile;

    // Otherwise, find the two values between which the measurement falls.
    for (let i = 0; i < percentiles.length - 1; i++) {
      const lower = percentiles[i];
      const upper = percentiles[i + 1];
      if (measurement >= lower.value && measurement <= upper.value) {
        // Calculate the relative position of the measurement between the two points.
        const fraction =
          (measurement - lower.value) / (upper.value - lower.value);
        // Interpolate between the two percentiles.
        const result = lower.percentile + fraction * (upper.percentile - lower.percentile);
        return Math.round(result * 100) / 100;
      }
    }

    return NaN;
  }

  /**
   * Create a growthData
   */
  createGrowthData = async (
    requesterInfo: Request["userInfo"],
    childId: string,
    growthData: Partial<IGrowthData>
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
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Growth data not found"
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

      // Get conversion rate
      const conversionRate = await this.configRepository.getConfig(
        "WHO_MONTH_TO_DAY_CONVERSION_RATE"
      );
      if (!conversionRate) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          "Internal Server Error"
        );
      }
      const cvValue = parseFloat(conversionRate.value);

      // Generate result
      const today = new Date(growthData.inputDate as Date).getTime();
      const birth = new Date(child.birthDate).getTime();

      const diffInTime = today - birth;
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      const diffInWeeks = diffInDays / 7;
      const diffInMonths = diffInDays / cvValue;

      const ageInDays = Math.round(diffInDays);
      const ageInWeeks = Math.round(diffInWeeks);
      const ageInMonths = Math.round(diffInMonths);

      let growthMetricsForAgeData: IGrowthMetricForAge[];
      if (ageInDays <= 1856) {
        growthMetricsForAgeData =
          await this.growthMetricsRepository.getGrowthMetricsForAgeData(
            child.gender,
            ageInDays,
            "day"
          );
      } else {
        growthMetricsForAgeData =
          await this.growthMetricsRepository.getGrowthMetricsForAgeData(
            child.gender,
            ageInMonths,
            "month"
          );
      }

      const { height, weight, headCircumference, armCircumference } =
        growthData;

      const bmi = (weight! / height! / height!) * 10000;

      let growthResult: Partial<IGrowthResult> = {
        height: {
          description: "N/A",
          level: "N/A",
        },
        weight: {
          description: "N/A",
          level: "N/A",
        },
        bmi: {
          description: "N/A",
          level: "N/A",
        },
        headCircumference: {
          description: "N/A",
          level: "N/A",
        },
        armCircumference: {
          description: "N/A",
          level: "N/A",
        },
      };

      growthMetricsForAgeData.forEach((data) => {
        switch (data.type) {
          case "BFA": {
            const percentile = this.getPercentile(bmi, data.percentiles.values);
            growthResult!.bmi!.description =
              `Your child is in the ${percentile} percentile for BMI. That means ${percentile} percent of ${child.gender === 0 ? "boys" : "girls"} at that age have a lower BMI, while ${(100 - percentile).toFixed(2)} percent have a higher BMI.`;
            
            if (percentile < 5) {
              growthResult!.bmi!.level = BmiLevelEnum[0];
            } else if (percentile >= 5 && percentile < 15) {
              growthResult!.bmi!.level = BmiLevelEnum[1];
            } else if (percentile >= 15 && percentile < 95) {
              growthResult!.bmi!.level = BmiLevelEnum[2];
            } else if (percentile >= 95) {
              growthResult!.bmi!.level = BmiLevelEnum[3];
            }
            break;
          }
          case "LHFA": {
            const percentile = this.getPercentile(height!, data.percentiles.values);
            growthResult!.height!.description =
              `Your child is in the ${percentile} percentile for height. That means ${percentile} percent of ${child.gender === 0 ? "boys" : "girls"} at that age are shorter, while ${(100 - percentile).toFixed(2)} percent are taller.`;
            
            if (percentile < 5) {
              growthResult!.height!.level = LevelEnum[0];
            } else if (percentile >= 5 && percentile < 15) {
              growthResult!.height!.level = LevelEnum[1];
            } else if (percentile >= 15 && percentile < 85) {
              growthResult!.height!.level = LevelEnum[2];
            } else if (percentile >= 85 && percentile < 95) {
              growthResult!.height!.level = LevelEnum[3];
            } else if (percentile >= 95) {
              growthResult!.height!.level = LevelEnum[4];
            }
            break;
          }
          case "WFA": {
            const percentile = this.getPercentile(weight!, data.percentiles.values);
            growthResult!.weight!.description =
              `Your child is in the ${percentile} percentile for weight. That means ${percentile} percent of ${child.gender === 0 ? "boys" : "girls"} at that age weigh less, while ${(100 - percentile).toFixed(2)} percent weigh more.`;
            
            if (percentile < 5) {
              growthResult!.weight!.level = LevelEnum[0];
            } else if (percentile >= 5 && percentile < 15) {
              growthResult!.weight!.level = LevelEnum[1];
            } else if (percentile >= 15 && percentile < 85) {
              growthResult!.weight!.level = LevelEnum[2];
            } else if (percentile >= 85 && percentile < 95) {
              growthResult!.weight!.level = LevelEnum[3];
            } else if (percentile >= 95) {
              growthResult!.weight!.level = LevelEnum[4];
            }
            break;
          }
          case "HCFA": {
            const percentile = this.getPercentile(headCircumference!, data.percentiles.values);
            growthResult!.headCircumference!.description =
              `Your child is in the ${percentile} percentile for head circumference. That means ${percentile} percent of ${child.gender === 0 ? "boys" : "girls"} at that age have a smaller head circumference, while ${(100 - percentile).toFixed(2)} percent have a larger head circumference.`;
            
            if (percentile < 5) {
              growthResult!.headCircumference!.level = LevelEnum[0];
            } else if (percentile >= 5 && percentile < 15) {
              growthResult!.headCircumference!.level = LevelEnum[1];
            } else if (percentile >= 15 && percentile < 85) {
              growthResult!.headCircumference!.level = LevelEnum[2];
            } else if (percentile >= 85 && percentile < 95) {
              growthResult!.headCircumference!.level = LevelEnum[3];
            } else if (percentile >= 95) {
              growthResult!.headCircumference!.level = LevelEnum[4];
            }
            break;
          }
          case "ACFA": {
            const percentile = this.getPercentile(armCircumference!, data.percentiles.values);
            growthResult!.armCircumference!.description =
              `Your child is in the ${percentile} percentile for arm circumference. That means ${percentile} percent of ${child.gender === 0 ? "boys" : "girls"} at that age have a smaller arm circumference, while ${(100 - percentile).toFixed(2)} percent have a larger arm circumference.`;
            
            if (percentile < 5) {
              growthResult!.armCircumference!.level = LevelEnum[0];
            } else if (percentile >= 5 && percentile < 15) {
              growthResult!.armCircumference!.level = LevelEnum[1];
            } else if (percentile >= 15 && percentile < 85) {
              growthResult!.armCircumference!.level = LevelEnum[2];
            } else if (percentile >= 85 && percentile < 95) {
              growthResult!.armCircumference!.level = LevelEnum[3];
            } else if (percentile >= 95) {
              growthResult!.armCircumference!.level = LevelEnum[4];
            }
            
            console.log("Arm Circumference Percentile:", percentile);
            break;
          }
        }
      });
      growthData.growthResult = growthResult;
      
      // Growth data creation
      growthData.childId = new mongoose.Types.ObjectId(childId);
      const createdGrowthData =
        await this.growthDataRepository.createGrowthData(growthData, session);

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
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            true
          );
          break;

        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            false
          );
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Growth data not found"
          );
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(
        growthData.childId.toString(),
        false
      );
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
          growthData = await this.growthDataRepository.getGrowthDataByChildId(
            childId,
            query,
            true
          );
          break;

        case UserEnum.MEMBER:
        case UserEnum.DOCTOR:
          growthData = await this.growthDataRepository.getGrowthDataByChildId(
            childId,
            query,
            false
          );
          break;

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Growth data not found"
          );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(
        childId.toString(),
        false
      );
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
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            true
          );
          break;

        case UserEnum.MEMBER:
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            false
          );
          break;

        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Growth data not found"
          );
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(
        growthData.childId.toString(),
        false
      );
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
          "Growth data not found"
        );
      }

      const deletedGrowthData =
        await this.growthDataRepository.deleteGrowthData(growthDataId, session);
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
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            true
          );
          break;

        case UserEnum.MEMBER:
          growthData = await this.growthDataRepository.getGrowthDataById(
            growthDataId,
            false
          );
          break;

        case UserEnum.DOCTOR:
          throw new CustomException(StatusCodeEnum.Forbidden_403, "Forbidden");

        default:
          throw new CustomException(
            StatusCodeEnum.NotFound_404,
            "Growth data not found"
          );
      }
      if (!growthData) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

      // Get child data
      const child: IChild | null = await this.childRepository.getChildById(
        growthData.childId.toString(),
        false
      );
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
          "Growth data not found"
        );
      }

      const updatedGrowthData =
        await this.growthDataRepository.updateGrowthData(
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
