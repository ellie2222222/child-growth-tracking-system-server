import CommentController from "../controllers/CommentController";
import { Router } from "express";
import CommentHandler from "../handlers/CommentHandler";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import CommentService from "../services/CommentService";

const router = Router();
const commentHandler = new CommentHandler();
const commentService = new CommentService();
const commentController = new CommentController(commentService);

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  commentHandler.createComment,
  commentController.createComment
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  commentHandler.updateComment,
  commentController.updateComment
);

router.get(
  "/",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  commentHandler.getComments,
  commentController.getCommentsByPostId
);

router.get(
  "/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  commentHandler.getComment,
  commentController.getComment
);

router.delete(
  "/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  commentHandler.deleteComment,
  commentController.deleteComment
);

export default router;
