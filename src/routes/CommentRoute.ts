import CommentController from "../controllers/CommentController";
import { Router } from "express";

const router = Router();
const commentController = new CommentController();

router.post("/", commentController.createComment);
router.put("/:id", commentController.updateComment);
router.get("/", commentController.getCommentsByPostId);
router.get("/:id", commentController.getComment);
router.delete("/:id", commentController.deleteComment);

export default router;
