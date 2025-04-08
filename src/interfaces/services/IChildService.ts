import { Request } from "express";
import { IChild } from "../models/IChild";
import { ChildrenData } from "../../repositories/ChildRepository";
import { IQuery } from "../models/IQuery";

export interface IChildService {
  createChild: (
    requesterInfo: Request["userInfo"],
    childData: Partial<IChild>
  ) => Promise<IChild>;

  getChildById: (
    childId: string,
    requesterInfo: Request["userInfo"]
  ) => Promise<IChild | null>;

  getChildrenByUserId: (
    userId: string,
    requesterInfo: Request["userInfo"],
    query: IQuery
  ) => Promise<ChildrenData>;

  deleteChild: (
    childId: string,
    requesterInfo: Request["userInfo"]
  ) => Promise<void>;

  updateChild: (
    childId: string,
    requesterInfo: Request["userInfo"],
    updateData: Partial<IChild>
  ) => Promise<IChild | null>;
}
