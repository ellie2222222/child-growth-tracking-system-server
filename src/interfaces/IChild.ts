import { Document, Schema } from "mongoose";
import { GenderEnumType } from "../enums/GenderEnum";

export type RelationshipType = "Parent" | "Sibling" | "Guardian" | "Other";

export const Relationship = ["Parent", "Sibling", "Guardian", "Other"];

export interface IChild extends Document {
  memberId: Schema.Types.ObjectId | string;
  name: string;
  gender: GenderEnumType;
  birthDate: Date;
  note: string;
  relationships: Array<{
    memberId: Schema.Types.ObjectId | string;
    type: RelationshipType;
  }>;
  relationship: RelationshipType;
  createdAt?: Date;
  updatedAt?: Date;
}
