import mongoose, { ClientSession, ObjectId } from "mongoose";
import { IMembershipPackage } from "../IMembershipPackage";
import { IQuery } from "../IQuery";

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
  ): Promise<object>;

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
