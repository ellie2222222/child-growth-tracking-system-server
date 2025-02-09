import mongoose, { Schema } from "mongoose";
import { IPost } from "../interfaces/IPost";

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
    },
    thumbnailUrl: { type: String },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strict: true }
);

const PostModel = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
