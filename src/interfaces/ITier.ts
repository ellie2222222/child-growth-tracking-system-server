import { IBaseEntity } from "../models/BaseModel";

export interface ITier extends IBaseEntity {
  tier: number;
  childrenLimit: number;
  postsLimit: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
