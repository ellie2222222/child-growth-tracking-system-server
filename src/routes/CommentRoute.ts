import CommentController from "../controllers/CommentController";
import { Router } from "express";
import CommentHandler from "../handlers/CommentHandler";

const router = Router();
const commentController = new CommentController();
const commentHandler = new CommentHandler();
router.post("/", commentHandler.createComment, commentController.createComment);
router.put(
  "/:id",
  commentHandler.updateComment,
  commentController.updateComment
);
router.get(
  "/",
  commentHandler.getComments,
  commentController.getCommentsByPostId
);
router.get("/:id", commentHandler.getComment, commentController.getComment);
router.delete(
  "/:id",
  commentHandler.deleteComment,
  commentController.deleteComment
);

export default router;
