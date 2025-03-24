import { ObjectId } from "mongoose";
import {
  DurationType,
  PriceType,
} from "../../services/MembershipPackagesService";
import { IMembershipPackage } from "../IMembershipPackage";
import { ReturnDataMembershipPackages } from "../../repositories/MembershipPackageRepository";
import { IQuery } from "../IQuery";

export interface IMembershipPackageService {
  createMembershipPackage: (
    name: string,
    description: string,
    price: PriceType,
    duration: DurationType,
    postLimit: number,
    updateChildDataLimit: number
  ) => Promise<IMembershipPackage>;

  getMembershipPackage: (
    id: string | ObjectId,
    requesterId: string
  ) => Promise<IMembershipPackage>;
  getMembershipPackages: (
    query: IQuery,
    requesterId: string
  ) => Promise<ReturnDataMembershipPackages>;

  updateMembershipPackage: (
    id: string | ObjectId,
    name: string,
    description: string,
    price: PriceType,
    duration: DurationType,
    postLimit: number,
    updateChildDataLimit: number
  ) => Promise<IMembershipPackage>;
  deleteMembershipPackage: (id: string | ObjectId) => Promise<boolean>;
}
