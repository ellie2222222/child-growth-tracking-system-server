import mongoose, { Schema, Document, Model } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IChild, Relationship } from "../interfaces/IChild";
import GenderEnum from "../enums/GenderEnum";

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
      default: "",
      trim: true,
    },
    gender: { 
      type: Number,
      enum: Object.keys(GenderEnum),
      required: true,
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
    ...baseModelSchema.obj,
  },
  { timestamps: true, strict: true }
);

childModelSchema.index({ "relationships.memberId": 1, _id: 1 }, { unique: true });

const ChildModel: Model<IChild> = mongoose.model<IChild>("Child", childModelSchema);

export default ChildModel;
