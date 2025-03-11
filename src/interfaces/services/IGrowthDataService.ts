import { Request } from "express";
import { GrowthData } from "../../repositories/GrowthDataRepository";
import { IGrowthData } from "../IGrowthData";
import { IQuery } from "../IQuery";
import { IGrowthVelocityResult } from "../IGrowthVelocityResult";

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
}
