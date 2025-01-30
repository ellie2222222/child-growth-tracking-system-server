import mongoose, { Schema } from "mongoose";
import { IComment } from "../interfaces/IComment";

const CommentSchema = new Schema<IComment>(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);
export default CommentModel;
