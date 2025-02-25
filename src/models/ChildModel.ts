import mongoose, { Schema, Document, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IChild, Relationship } from "../interfaces/IChild";
import GenderEnum from "../enums/GenderEnum";
import { FeedingTypeEnum } from "../enums/FeedingTypeEnum";
import { AllergyEnum } from "../enums/AllergyEnum";
import { IGrowthVelocityResult } from "../interfaces/IGrowthVelocityResult";

const growthVelocityResultSchema = new Schema<IGrowthVelocityResult>(
  {
    period: { type: String }, 
    startDate: { type: Date }, 
    endDate: { type: Date }, 
    weight: {
      weightVelocity: { type: Number, default: null },
      description: { type: String },
    },
    height: {
      heightVelocity: { type: Number, default: null },
      description: { type: String },
    },
    headCircumference: {
      headCircumferenceVelocity: { type: Number, default: null },
      description: { type: String },
    },
  },
  { _id: false }
);

const childModelSchema = new Schema<IChild>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      default: "N/A",
      trim: true,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      required: true,
    },
    feedingType: {
      type: String,
      enum: Object.values(FeedingTypeEnum),
      default: "N/A",
    },
    allergies: {
      type: String,
      enum: Object.values(AllergyEnum),
      default: "N/A"
    },
    relationships: [
      {
        memberId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          required: true,
          trim: true,
          enum: [...Relationship],
        },
      },
    ],
    growthVelocityResult: { type: [growthVelocityResultSchema], default: [] },
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

childModelSchema.index(
  { "relationships.memberId": 1, _id: 1 },
  { unique: true }
);

const ChildModel: Model<IChild> = mongoose.model<IChild>(
  "Child",
  childModelSchema
);

export default ChildModel;
