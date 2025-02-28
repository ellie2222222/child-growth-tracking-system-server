import { IBaseEntity } from "../models/BaseModel";

export interface ILimitObject {
  value: number;
  time: number; //default in day
  description: string;
}

export interface ITier extends IBaseEntity {
  tier: number;
  postsLimit: ILimitObject;
  updateRecordsLimit: ILimitObject;
  viewRecordsLimit: ILimitObject;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
