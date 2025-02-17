import mongoose, { Schema } from "mongoose";
import { IPost, PostStatus } from "../interfaces/IPost";

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
    status: {
      type: String,
      enum: PostStatus,
      default: PostStatus.PENDING,
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
