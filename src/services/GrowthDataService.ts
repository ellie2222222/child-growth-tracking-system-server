import Database from "../utils/database";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IQuery } from "../interfaces/IQuery";
// import UserRepository from "../repositories/UserRepository";
import { Request } from "express";
import UserEnum from "../enums/UserEnum";
// import ChildRepository from "../repositories/ChildRepository";
import { IChild } from "../interfaces/IChild";
import mongoose from "mongoose";
import { GrowthData } from "../repositories/GrowthDataRepository";
// import GrowthDataRepository from "../repositories/GrowthDataRepository";
import { IGrowthData } from "../interfaces/IGrowthData";
// import ConfigRepository from "../repositories/ConfigRepository";
// import GrowthMetricsRepository from "../repositories/GrowthMetricsRepository";
import { IGrowthMetricForAge } from "../interfaces/IGrowthMetricForAge";
import { IGrowthResult } from "../interfaces/IGrowthResult";
import { BmiLevelEnum, LevelEnum } from "../enums/LevelEnum";
import { IGrowthVelocity } from "../interfaces/IGrowthVelocity";
import { IGrowthVelocityResult } from "../interfaces/IGrowthVelocityResult";

import { IGrowthDataService } from "../interfaces/services/IGrowthDataService";
import { IGrowthDataRepository } from "../interfaces/repositories/IGrowthDataRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IChildRepository } from "../interfaces/repositories/IChildRepository";
import { IConfigRepository } from "../interfaces/repositories/IConfigRepository";
import { IGrowthMetricsRepository } from "../interfaces/repositories/IGrowthMetricsForAgeRepository";

import sendMail from "../utils/mailer";
import Mail from "nodemailer/lib/mailer";
import ejs from "ejs";
import path from "path";
import getLogger from "../utils/logger";

const emailTemplatePath = path.resolve(
  __dirname,
  "../templates/IrregularStatus.ejs"
);
class GrowthDataService implements IGrowthDataService {
  private growthDataRepository: IGrowthDataRepository;
  private userRepository: IUserRepository;
  private childRepository: IChildRepository;
  private configRepository: IConfigRepository;
  private growthMetricsRepository: IGrowthMetricsRepository;
  private database: Database;

  constructor(
    growthDataRepository: IGrowthDataRepository,
    userRepository: IUserRepository,
    childRepository: IChildRepository,
    configRepository: IConfigRepository,
    growthMetricsRepository: IGrowthMetricsRepository
  ) {
    this.growthDataRepository = growthDataRepository;
    this.userRepository = userRepository;
    this.childRepository = childRepository;
    this.configRepository = configRepository;
    this.growthMetricsRepository = growthMetricsRepository;
    this.database = Database.getInstance();
  }

  private getPercentile(
    measurement: number,
    percentiles: Array<{ percentile: number; value: number }>
  ): number {
   
   
    if (measurement <= percentiles[0].value) return percentiles[0].percentile;

   
   
    if (measurement >= percentiles[percentiles.length - 1].value)
      return percentiles[percentiles.length - 1].percentile;

   
    for (let i = 0; i < percentiles.length - 1; i++) {
      const lower = percentiles[i];
      const upper = percentiles[i + 1];
      if (measurement >= lower.value && measurement <= upper.value) {
       
        const fraction =
          (measurement - lower.value) / (upper.value - lower.value);
       
        const result =
          lower.percentile + fraction * (upper.percentile - lower.percentile);
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

     
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Child not found"
        );
      }

     
      const childGrowthData =
        await this.growthDataRepository.getAllGrowthDataByChildId(
          child._id as string
        );

      childGrowthData.forEach((data) => {
        if (
          growthData.inputDate &&
          data.inputDate &&
          new Date(growthData.inputDate).getTime() ===
            new Date(data.inputDate).getTime()
        ) {
          throw new CustomException(
            StatusCodeEnum.Conflict_409,
            "Growth data of this date already exists. Try another input date or update existing growth data"
          );
        }
      });

      const growthResult = await this.generateGrowthResult(growthData, child);
      growthData.growthResult = growthResult;

     
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

  publicGenerateGrowthData = async (
    growthData: Partial<IGrowthData>,
    birthDate: Date,
    gender: number
  ): Promise<Partial<IGrowthResult>> => {
    try {
      const growthDataResult = await this.generateGrowthResult2(
        growthData,
        birthDate,
        gender as 0 | 1
      );

      return growthDataResult;
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

  private generateGrowthResult = async (
    growthData: Partial<IGrowthData>,
    child: IChild
  ): Promise<Partial<IGrowthResult>> => {
   
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

    const { height, weight, headCircumference, armCircumference } = growthData;

    const bmi = (weight! / height! / height!) * 10000;

    const growthResult: Partial<IGrowthResult> = {
      height: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      weight: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      bmi: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      headCircumference: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      armCircumference: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      weightForLength: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
    };
    let irregular = false;
    const formatPercentile = (percentile: number) =>
      percentile % 1 === 0 ? `${percentile}` : percentile.toFixed(2);

    growthMetricsForAgeData.forEach((data) => {
      switch (data.type) {
        case "BFA": {
          const percentile = this.getPercentile(bmi, data.percentiles.values);
          growthResult!.bmi!.percentile = percentile;
          growthResult!.bmi!.description = `Your child is in the ${percentile} percentile for BMI. That means ${percentile} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a lower BMI, while ${formatPercentile(
            100 - percentile
          )} percent have a higher BMI.`;

          if (percentile < 5) {
            growthResult!.bmi!.level = BmiLevelEnum[0];
            irregular = true;
          } else if (percentile >= 5 && percentile < 15) {
            growthResult!.bmi!.level = BmiLevelEnum[1];
          } else if (percentile >= 15 && percentile < 95) {
            growthResult!.bmi!.level = BmiLevelEnum[2];
          } else if (percentile >= 95) {
            growthResult!.bmi!.level = BmiLevelEnum[3];
            irregular = true;
          }
          break;
        }

        case "LHFA": {
          const percentile = this.getPercentile(
            height!,
            data.percentiles.values
          );
          growthResult!.height!.percentile = percentile;
          growthResult!.height!.description = `Your child is in the ${percentile} percentile for height. That means ${percentile} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age are shorter, while ${formatPercentile(
            100 - percentile
          )} percent are taller.`;

          if (percentile < 5) {
            irregular = true;
            growthResult!.height!.level = LevelEnum[0];
          } else if (percentile >= 5 && percentile < 15) {
            growthResult!.height!.level = LevelEnum[1];
          } else if (percentile >= 15 && percentile < 85) {
            growthResult!.height!.level = LevelEnum[2];
          } else if (percentile >= 85 && percentile < 95) {
            growthResult!.height!.level = LevelEnum[3];
          } else if (percentile >= 95) {
            growthResult!.height!.level = LevelEnum[4];
            irregular = true;
          }
          break;
        }

        case "WFA": {
          const percentile = this.getPercentile(
            weight!,
            data.percentiles.values
          );
          growthResult!.weight!.percentile = percentile;
          growthResult!.weight!.description = `Your child is in the ${percentile} percentile for weight. That means ${percentile} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age weigh less, while ${formatPercentile(
            100 - percentile
          )} percent weigh more.`;

          if (percentile < 5) {
            irregular = true;
            growthResult!.weight!.level = LevelEnum[0];
          } else if (percentile >= 5 && percentile < 15) {
            growthResult!.weight!.level = LevelEnum[1];
          } else if (percentile >= 15 && percentile < 85) {
            growthResult!.weight!.level = LevelEnum[2];
          } else if (percentile >= 85 && percentile < 95) {
            growthResult!.weight!.level = LevelEnum[3];
          } else if (percentile >= 95) {
            irregular = true;
            growthResult!.weight!.level = LevelEnum[4];
          }
          break;
        }

        case "HCFA": {
          if (
            typeof headCircumference !== "number" ||
            !Number.isFinite(headCircumference)
          ) {
            growthResult.headCircumference = {
              percentile: -1,
              description: "N/A",
              level: "N/A",
            };
            break;
          }

          const percentile = this.getPercentile(
            headCircumference!,
            data.percentiles.values
          );
          growthResult!.headCircumference!.percentile = percentile;
          growthResult!.headCircumference!.description = `Your child is in the ${percentile} percentile for head circumference. That means ${percentile} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a smaller head circumference, while ${formatPercentile(
            100 - percentile
          )} percent have a larger head circumference.`;

          if (percentile < 5) {
            if (percentile !== -1) irregular = true;
            growthResult!.headCircumference!.level = LevelEnum[0];
          } else if (percentile >= 5 && percentile < 15) {
            growthResult!.headCircumference!.level = LevelEnum[1];
          } else if (percentile >= 15 && percentile < 85) {
            growthResult!.headCircumference!.level = LevelEnum[2];
          } else if (percentile >= 85 && percentile < 95) {
            growthResult!.headCircumference!.level = LevelEnum[3];
          } else if (percentile >= 95) {
            if (percentile !== -1) irregular = true;
            growthResult!.headCircumference!.level = LevelEnum[4];
          }
          break;
        }

        case "ACFA": {
          if (
            typeof armCircumference !== "number" ||
            !Number.isFinite(armCircumference)
          ) {
            growthResult.armCircumference = {
              percentile: -1,
              description: "N/A",
              level: "N/A",
            };
            break;
          }

          const percentile = this.getPercentile(
            armCircumference!,
            data.percentiles.values
          );
          growthResult!.armCircumference!.percentile = percentile;
          growthResult!.armCircumference!.description = `Your child is in the ${percentile} percentile for arm circumference. That means ${percentile} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a smaller arm circumference, while ${formatPercentile(
            100 - percentile
          )} percent have a larger arm circumference.`;

          if (percentile < 5) {
            if (percentile !== -1) irregular = true;
            growthResult!.armCircumference!.level = LevelEnum[0];
          } else if (percentile >= 5 && percentile < 15) {
            growthResult!.armCircumference!.level = LevelEnum[1];
          } else if (percentile >= 15 && percentile < 85) {
            growthResult!.armCircumference!.level = LevelEnum[2];
          } else if (percentile >= 85 && percentile < 95) {
            growthResult!.armCircumference!.level = LevelEnum[3];
          } else if (percentile >= 95) {
            if (percentile !== -1) irregular = true;
            growthResult!.armCircumference!.level = LevelEnum[4];
          }
          break;
        }
      }
    });

    const wflhData = await this.growthMetricsRepository.getWflhData(
      child.gender,
      height!
    );
    wflhData.forEach((data) => {
      const percentile = this.getPercentile(height!, data.percentiles.values);
      growthResult!.weightForLength!.percentile = percentile;
      growthResult!.weightForLength!.description = `Your child is in the ${percentile} percentile for weight for height. That means ${percentile} percent of ${
        child.gender === 0 ? "boys" : "girls"
      } at that age have a lower weight for height, while ${formatPercentile(
        100 - percentile
      )} percent have a higher weight for height.`;

      if (percentile < 5) {
        irregular = true;
        growthResult!.weightForLength!.level = LevelEnum[0];
      } else if (percentile >= 5 && percentile < 15) {
        growthResult!.weightForLength!.level = LevelEnum[1];
      } else if (percentile >= 15 && percentile < 85) {
        growthResult!.weightForLength!.level = LevelEnum[2];
      } else if (percentile >= 85 && percentile < 95) {
        growthResult!.weightForLength!.level = LevelEnum[3];
      } else if (percentile >= 95) {
        irregular = true;
        growthResult!.weightForLength!.level = LevelEnum[4];
      }
    });

    if (irregular) {
      const emailHtml = await ejs.renderFile(emailTemplatePath, {
        growthResult,
      });

      const userIds = child.relationships.map(
        (relationship) => relationship.memberId
      );

      try {
       
        const users = await Promise.all(
          userIds.map((userId) =>
            this.userRepository.getUserById(userId.toString(), false)
          )
        );

       
        const validUsers = users.filter((user) => user !== null);

       
        const emailPromises = validUsers.map((user) => {
          const mailOptions: Mail.Options = {
            from: process.env.EMAIL_USER,
            to: user!.email,
            subject: `Request Status Update`,
            html: emailHtml,
          };
          return sendMail(mailOptions);
        });

       
        await Promise.all(emailPromises);
      } catch (error) {
        const logger = getLogger("ABNORMAL GROWTH RESULT");
        logger.error((error as Error | CustomException).message);
      }
    }

    return growthResult;
  };

  private generateGrowthResult2 = async (
    growthData: Partial<IGrowthData>,
    birthDate: Date,
    gender: 0 | 1
  ): Promise<Partial<IGrowthResult>> => {
   
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

   
    const today = new Date(growthData.inputDate as Date).getTime();
    const birth = new Date(birthDate).getTime();

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
          gender,
          ageInDays,
          "day"
        );
    } else {
      growthMetricsForAgeData =
        await this.growthMetricsRepository.getGrowthMetricsForAgeData(
          gender,
          ageInMonths,
          "month"
        );
    }

    const { height, weight, headCircumference, armCircumference } = growthData;

    const bmi = (weight! / height! / height!) * 10000;

    let growthResult: Partial<IGrowthResult> = {
      height: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      weight: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      bmi: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      headCircumference: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      armCircumference: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
      weightForLength: {
        percentile: -1,
        description: "N/A",
        level: "N/A",
      },
    };

    const formatPercentile = (percentile: number) =>
      percentile % 1 === 0 ? `${percentile}` : percentile.toFixed(2);

    growthMetricsForAgeData.forEach((data) => {
      switch (data.type) {
        case "BFA": {
          const percentile = this.getPercentile(bmi, data.percentiles.values);
          growthResult!.bmi!.percentile = percentile;
          growthResult!.bmi!.description = `Your child is in the ${percentile} percentile for BMI. That means ${percentile} percent of ${
            gender === 0 ? "boys" : "girls"
          } at that age have a lower BMI, while ${formatPercentile(
            100 - percentile
          )} percent have a higher BMI.`;

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
          const percentile = this.getPercentile(
            height!,
            data.percentiles.values
          );
          growthResult!.height!.percentile = percentile;
          growthResult!.height!.description = `Your child is in the ${percentile} percentile for height. That means ${percentile} percent of ${
            gender === 0 ? "boys" : "girls"
          } at that age are shorter, while ${formatPercentile(
            100 - percentile
          )} percent are taller.`;

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
          const percentile = this.getPercentile(
            weight!,
            data.percentiles.values
          );
          growthResult!.weight!.percentile = percentile;
          growthResult!.weight!.description = `Your child is in the ${percentile} percentile for weight. That means ${percentile} percent of ${
            gender === 0 ? "boys" : "girls"
          } at that age weigh less, while ${formatPercentile(
            100 - percentile
          )} percent weigh more.`;

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
          if (
            typeof headCircumference !== "number" ||
            !Number.isFinite(headCircumference)
          ) {
            growthResult.headCircumference = {
              percentile: -1,
              description: "N/A",
              level: "N/A",
            };
            break;
          }
          const percentile = this.getPercentile(
            headCircumference!,
            data.percentiles.values
          );
          growthResult!.headCircumference!.percentile = percentile;
          growthResult!.headCircumference!.description = `Your child is in the ${percentile} percentile for head circumference. That means ${percentile} percent of ${
            gender === 0 ? "boys" : "girls"
          } at that age have a smaller head circumference, while ${formatPercentile(
            100 - percentile
          )} percent have a larger head circumference.`;

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
          if (
            typeof armCircumference !== "number" ||
            !Number.isFinite(armCircumference)
          ) {
            growthResult.armCircumference = {
              percentile: -1,
              description: "N/A",
              level: "N/A",
            };
            break;
          }
          const percentile = this.getPercentile(
            armCircumference!,
            data.percentiles.values
          );
          growthResult!.armCircumference!.percentile = percentile;
          growthResult!.armCircumference!.description = `Your child is in the ${percentile} percentile for arm circumference. That means ${percentile} percent of ${
            gender === 0 ? "boys" : "girls"
          } at that age have a smaller arm circumference, while ${formatPercentile(
            100 - percentile
          )} percent have a larger arm circumference.`;

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
          break;
        }
      }
    });

    const wflhData = await this.growthMetricsRepository.getWflhData(
      gender,
      height!
    );
    wflhData.forEach((data) => {
      const percentile = this.getPercentile(height!, data.percentiles.values);
      growthResult!.weightForLength!.percentile = percentile;
      growthResult!.weightForLength!.description = `Your child is in the ${percentile} percentile for weight for height. That means ${percentile} percent of ${
        gender === 0 ? "boys" : "girls"
      } at that age have a lower weight for height, while ${formatPercentile(
        100 - percentile
      )} percent have a higher weight for height.`;

      if (percentile < 5) {
        growthResult!.weightForLength!.level = LevelEnum[0];
      } else if (percentile >= 5 && percentile < 15) {
        growthResult!.weightForLength!.level = LevelEnum[1];
      } else if (percentile >= 15 && percentile < 85) {
        growthResult!.weightForLength!.level = LevelEnum[2];
      } else if (percentile >= 85 && percentile < 95) {
        growthResult!.weightForLength!.level = LevelEnum[3];
      } else if (percentile >= 95) {
        growthResult!.weightForLength!.level = LevelEnum[4];
      }
    });

    return growthResult;
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

     
      const user = await this.userRepository.getUserById(requesterId, false);
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

     
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
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
   * Generate multiple growthData for a user
   */
  generateGrowthVelocityByChildId = async (
    childId: string,
    requesterInfo: Request["userInfo"]
  ): Promise<Partial<IGrowthVelocityResult>[]> => {
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

     
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );

      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }

     
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

     
      const today = new Date().getTime();
      const birth = new Date(child.birthDate).getTime();

      const diffInTime = today - birth;
      const diffInDays = diffInTime / (1000 * 3600 * 24);

      const ageInDays = Math.round(diffInDays);

     
      const oneMonthIncrementData: IGrowthVelocity[] = [];
      if (ageInDays >= cvValue) {
       
        const growthVelocityData: IGrowthVelocity[] =
          await this.growthMetricsRepository.getGrowthVelocityData(
            child.gender
          );

       
        let counter = 2;

        for (const data of growthVelocityData) {
          if (counter > 12) break;

          if (
            (data.firstInterval.inWeeks === 0 &&
              data.lastInterval.inWeeks === 4) ||
            (data.firstInterval.inWeeks === 4 &&
              data.lastInterval.inMonths === 2) ||
            (data.firstInterval.inMonths === counter &&
              data.lastInterval.inMonths === counter + 1)
          ) {
            oneMonthIncrementData.push(data);

            if (
              data.firstInterval.inMonths === counter &&
              data.lastInterval.inMonths === counter + 1
            ) {
              counter += 1;
            }
          }
        }
      }
     
      const results = await this.calculateGrowthVelocity(
        child,
        oneMonthIncrementData,
        cvValue
      );

     
      const updateData: Partial<IChild> = {
        growthVelocityResult: results as IGrowthVelocityResult[],
      };
      await this.childRepository.updateChild(childId, updateData, session);

      await this.database.commitTransaction(session);
      return results;
    } catch (error) {
      await this.database.abortTransaction(session);
      throw error;
    }
  };

  private calculateGrowthVelocity = async (
    child: IChild,
    oneMonthIncrementData: IGrowthVelocity[],
    conversionRate: number
  ): Promise<Partial<IGrowthVelocityResult>[]> => {
    const growthData =
      await this.growthDataRepository.getAllGrowthDataByChildId(
        child._id as string
      );
    const results: Partial<IGrowthVelocityResult>[] = [];

    for (const interval of oneMonthIncrementData) {
     
      const startDays = interval.firstInterval.inDays;
      const endDays = interval.lastInterval.inDays;

     
      const startData = this.findClosestGrowthData(
        growthData,
        startDays,
        child.birthDate
      );
      const endData = this.findClosestGrowthData(
        growthData,
        endDays,
        child.birthDate
      );

      if (!startData || !endData) {
        results.push({
          period: this.getIntervalDescription(interval),
          startDate: new Date(child.birthDate.getTime() + startDays * 86400000),
          endDate: new Date(child.birthDate.getTime() + endDays * 86400000),
          height: {
            percentile: -1,
            heightVelocity: -1,
            description: "Insufficient data",
          },
          weight: {
            percentile: -1,
            weightVelocity: -1,
            description: "Insufficient data",
          },
          headCircumference: {
            percentile: -1,
            headCircumferenceVelocity: -1,
            description: "Insufficient data",
          },
        });
        continue;
      }

     
      const timeDiffMonths =
        (endData.inputDate.getTime() - startData.inputDate.getTime()) /
        (conversionRate * 86400000);

     
      const heightVelocity = this.calculateMetricVelocity(
        startData.height,
        endData.height,
        timeDiffMonths
      );
      const weightVelocity = this.calculateMetricVelocity(
        startData.weight,
        endData.weight,
        timeDiffMonths
      );
      const headCircumferenceVelocity = this.calculateMetricVelocity(
        startData.headCircumference,
        endData.headCircumference,
        timeDiffMonths
      );

     
      const heightPercentile =
        heightVelocity !== null
          ? this.getPercentile(heightVelocity, interval.percentiles.values)
          : null;
      const weightPercentile =
        weightVelocity !== null
          ? this.getPercentile(weightVelocity, interval.percentiles.values)
          : null;
      const headCircumferencePercentile =
        headCircumferenceVelocity !== null
          ? this.getPercentile(
              headCircumferenceVelocity,
              interval.percentiles.values
            )
          : null;

     
      const formatPercentile = (percentile: number) =>
        percentile % 1 === 0 ? `${percentile}` : percentile.toFixed(2);

      const heightDescription = heightPercentile
        ? `Your child is in the ${formatPercentile(
            heightPercentile
          )} percentile for height growth velocity. That means ${formatPercentile(
            heightPercentile
          )} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a slower height growth velocity, while ${formatPercentile(
            100 - heightPercentile
          )} percent have a faster height growth velocity.`
        : "Insufficient data to determine height percentile.";

      const weightDescription = weightPercentile
        ? `Your child is in the ${formatPercentile(
            weightPercentile
          )} percentile for weight growth velocity. That means ${formatPercentile(
            weightPercentile
          )} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a slower weight growth velocity, while ${formatPercentile(
            100 - weightPercentile
          )} percent have a faster weight growth velocity.`
        : "Insufficient data to determine weight percentile.";

      const headCircumferenceDescription = headCircumferencePercentile
        ? `Your child is in the ${formatPercentile(
            headCircumferencePercentile
          )} percentile for head circumference growth velocity. That means ${formatPercentile(
            headCircumferencePercentile
          )} percent of ${
            child.gender === 0 ? "boys" : "girls"
          } at that age have a slower head circumference growth velocity, while ${formatPercentile(
            100 - headCircumferencePercentile
          )} percent have a faster head circumference growth velocity.`
        : "Insufficient data to determine head circumference percentile.";

      results.push({
        period: this.getIntervalDescription(interval),
        startDate: startData.inputDate,
        endDate: endData.inputDate,
        height: {
          percentile: heightPercentile ? heightPercentile : -1,
          heightVelocity,
          description: heightDescription,
        },
        weight: {
          percentile: weightPercentile ? weightPercentile : -1,
          weightVelocity,
          description: weightDescription,
        },
        headCircumference: {
          percentile: headCircumferencePercentile
            ? headCircumferencePercentile
            : -1,
          headCircumferenceVelocity,
          description: headCircumferenceDescription,
        },
      });
    }

    return results;
  };

  private findClosestGrowthData = (
    growthData: IGrowthData[],
    targetDays: number,
    birthDate: Date
  ): IGrowthData | null => {
    const targetDate = new Date(birthDate.getTime() + targetDays * 86400000);
    let closestData: IGrowthData | null = null;
    let minDiff = Infinity;

    for (const data of growthData) {
      if (!(data.inputDate instanceof Date)) {
        data.inputDate = new Date(data.inputDate);
      }

      const dataDays = Math.floor(
        (data.inputDate.getTime() - birthDate.getTime()) / 86400000
      );

      const diff = Math.abs(dataDays - targetDays);

      if (diff < minDiff) {
       
        closestData = data;
        minDiff = diff;
      }
    }

    return closestData;
  };

  private calculateMetricVelocity = (
    startValue: number,
    endValue: number,
    timeDiffMonths: number
  ): number | null => {
    if (timeDiffMonths <= 0) return null;
    return (endValue - startValue) / timeDiffMonths;
  };

  private getIntervalDescription = (interval: IGrowthVelocity): string => {
    if (
      interval.firstInterval.inWeeks === 0 &&
      interval.lastInterval.inWeeks === 4
    ) {
      return "0 – 4 weeks";
    } else if (
      interval.firstInterval.inWeeks === 4 &&
      interval.lastInterval.inMonths === 2
    ) {
      return "4 weeks – 2 months";
    } else {
      return `${interval.firstInterval.inMonths} – ${interval.lastInterval.inMonths} months`;
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

     
      let growthData: GrowthData;
      switch (requesterRole) {
        case UserEnum.ADMIN:
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

     
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
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
        throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
      }
  
     
      let growthData: IGrowthData | null = null;
      switch (requesterRole) {
        case UserEnum.ADMIN:
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
  
     
      const child: IChild | null = await this.childRepository.getChildById(
        growthData.childId.toString(),
        false
      );
      if (!child) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Child not found");
      }
  
     
      const isRelated = child.relationships.some(
        (relationship) => relationship.memberId.toString() === requesterId
      );
  
      if (!isRelated && requesterRole === UserEnum.MEMBER) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Growth data not found"
        );
      }
  
     
      if (updateData.inputDate) {
        const oldInputDate = growthData.inputDate
          ? new Date(growthData.inputDate).getTime()
          : null;
        const newInputDate = new Date(updateData.inputDate).getTime();
  
       
        if (oldInputDate !== newInputDate) {
          const childGrowthData =
            await this.growthDataRepository.getAllGrowthDataByChildId(
              child._id as string
            );
  
          childGrowthData.forEach((data: IGrowthData) => {
            if (
              (data._id as string).toString() !== growthDataId &&
              data.inputDate &&
              new Date(data.inputDate).getTime() === newInputDate
            ) {
              throw new CustomException(
                StatusCodeEnum.Conflict_409,
                "Growth data of this date already exists. Try another input date or update existing growth data"
              );
            }
          });
        }
      }
  
     
      const growthResult = await this.generateGrowthResult(growthData, child);
      growthData.growthResult = growthResult;
  
     
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
