import { Request } from "express";
import { GrowthData } from "../../repositories/GrowthDataRepository";
import { IGrowthData } from "../models/IGrowthData";
import { IQuery } from "../models/IQuery";
import { IGrowthVelocityResult } from "../models/IGrowthVelocityResult";
import { IGrowthResult } from "../models/IGrowthResult";

export interface IGrowthDataService {
  createGrowthData: (
    requesterInfo: Request["userInfo"],
    childId: string,
    growthData: Partial<IGrowthData>
  ) => Promise<IGrowthData | null>;

  getGrowthDataById: (
    growthDataId: string,
    requesterInfo: Request["userInfo"]
  ) => Promise<IGrowthData | null>;

  generateGrowthVelocityByChildId: (
    childId: string,
    requesterInfo: Request["userInfo"]
  ) => Promise<Partial<IGrowthVelocityResult>[]>;

  getGrowthDataByChildId: (
    childId: string,
    requesterInfo: Request["userInfo"],
    query: IQuery
  ) => Promise<GrowthData>;

  deleteGrowthData: (
    growthDataId: string,
    requesterInfo: Request["userInfo"]
  ) => Promise<void>;

  updateGrowthData: (
    growthDataId: string,
    requesterInfo: Request["userInfo"],
    updateData: Partial<IGrowthData>
  ) => Promise<IGrowthData | null>;

  publicGenerateGrowthData: (
    growthData: Partial<IGrowthData>,
    birthDate: Date,
    gender: number
  ) => Promise<Partial<IGrowthResult>>;
}
