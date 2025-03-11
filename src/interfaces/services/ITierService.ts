import { ObjectId } from "mongoose";
import { ITier } from "../ITier";
import { ReturnDataTiers } from "../../repositories/TierRepository";
import { IQuery } from "../IQuery";

export interface ITierService {
  createTier: (
    tier: number,
    postsLimitValue: number,
    postLimitTime: number,
    updateRecordsLimitValue: number,
    updateRecordsLimitTime: number,
    viewRecordsLimitValue: number,
    viewRecordsLimitTime: number
  ) => Promise<ITier>;

  updateTier: (
    id: string | ObjectId,
    postsLimitValue: number,
    postLimitTime: number,
    updateRecordsLimitValue: number,
    updateRecordsLimitTime: number,
    viewRecordsLimitValue: number,
    viewRecordsLimitTime: number
  ) => Promise<ITier | null>;

  getTier: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<ITier | null>;

  getTiers: (
    query: IQuery,
    requesterId: string,
    ignoreDeleted: boolean
  ) => Promise<ReturnDataTiers>;
}
