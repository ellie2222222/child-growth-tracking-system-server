import { Document, Types } from "mongoose";
import { GenderEnumType } from "../enums/GenderEnum";

export type RelationshipType = "Parent" | "Sibling" | "Guardian" | "Other";

export const Relationship = ["Parent", "Sibling", "Guardian", "Other"];

export interface IChild extends Document {
  memberId: Types.ObjectId;
  name: string;
  gender: GenderEnumType;
  birthDate: Date;
  note: string;
  relationships: Array<{
    memberId: Types.ObjectId;
    type: RelationshipType;
  }>;
  relationship: RelationshipType;
  createdAt?: Date;
  updatedAt?: Date;
}
