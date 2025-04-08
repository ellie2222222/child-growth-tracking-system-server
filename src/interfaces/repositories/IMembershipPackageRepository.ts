import { ClientSession, ObjectId } from "mongoose";
import { IMembershipPackage } from "../models/IMembershipPackage";
import { IQuery } from "../models/IQuery";
import { ReturnDataMembershipPackages } from "../../repositories/MembershipPackageRepository";

export interface IMembershipPackageRepository {
  createMembershipPackage(
    data: object,
    session?: ClientSession
  ): Promise<IMembershipPackage>;

  getMembershipPackage(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IMembershipPackage | null>;

  getMembershipPackages(
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<ReturnDataMembershipPackages>;

  updateMembershipPackage(
    id: string | ObjectId,
    data: object,
    session?: ClientSession
  ): Promise<IMembershipPackage>;

  deleteMembershipPackage(
    id: string | ObjectId,
    session?: ClientSession
  ): Promise<boolean>;

  checkMembershipInUsers(membershipId: string | ObjectId): Promise<void>;

  getMembershipByName(name: string): Promise<IMembershipPackage | null>;
}
