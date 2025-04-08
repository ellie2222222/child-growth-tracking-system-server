import mongoose from "mongoose";
import { IChild } from "../models/IChild";
import { IQuery } from "../models/IQuery";

export interface IChildRepository {
  createChild(
    childData: Partial<IChild>,
    session?: mongoose.ClientSession
  ): Promise<IChild>;

  getChildById(childId: string, ignoreDeleted: boolean): Promise<IChild | null>;

  getChildrenByUserId(
    memberId: string,
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<{
    children: IChild[];
    page: number;
    total: number;
    totalPages: number;
  }>;

  updateChild(
    childId: string,
    updateData: Partial<IChild>,
    session?: mongoose.ClientSession
  ): Promise<IChild | null>;

  deleteChild(
    childId: string,
    session?: mongoose.ClientSession
  ): Promise<IChild | null>;

  countUserChildren(userId: string): Promise<number>;
}
