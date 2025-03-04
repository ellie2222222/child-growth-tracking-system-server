import mongoose, { ObjectId } from "mongoose";
import { ITier } from "../ITier";
import { IQuery } from "../IQuery";

export interface ITierRepository {
  createTier(
    data: Partial<ITier>,
    session?: mongoose.ClientSession
  ): Promise<ITier>;

  updateTier(
    id: string | ObjectId,
    data: object,
    session?: mongoose.ClientSession
  ): Promise<ITier>;

  getTier(id: string | ObjectId, ignoreDeleted: boolean): Promise<ITier | null>;

  getTiers(
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<object>;

  getCurrentTierData(tier: number): Promise<ITier>;
}
