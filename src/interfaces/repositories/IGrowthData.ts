import mongoose from "mongoose";
import { IGrowthData } from "../IGrowthData";
import { IQuery } from "../IQuery";
import { GrowthData } from "../../repositories/GrowthDataRepository";

export interface IGrowthDataRepository {
  createGrowthData(
    growthData: Partial<IGrowthData>,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData>;

  getGrowthDataById(
    growthDataId: string,
    isDeleted: boolean
  ): Promise<IGrowthData | null>;

  getGrowthDataByChildId(
    childId: string,
    query: IQuery,
    isDeleted: boolean
  ): Promise<GrowthData>;

  getAllGrowthDataByChildId(childId: string): Promise<IGrowthData[]>;

  updateGrowthData(
    growthDataId: string,
    updateData: Partial<IGrowthData>,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData | null>;

  deleteGrowthData(
    growthDataId: string,
    session?: mongoose.ClientSession
  ): Promise<IGrowthData | null>;

  countUserUpdateGrowthData(userId: string, start: Date, end: Date): Promise<number>;
}
