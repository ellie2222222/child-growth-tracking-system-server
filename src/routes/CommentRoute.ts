import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import CommentHandler from "../handlers/CommentHandler";

import CommentController from "../controllers/CommentController";

import CommentService from "../services/CommentService";

import CommentRepository from "../repositories/CommentRepository";
import PostRepository from "../repositories/PostRepository";
import UserRepository from "../repositories/UserRepository";

const commentRepository = new CommentRepository();
const postRepository = new PostRepository();
const userRepository = new UserRepository();

const commentService = new CommentService(
  commentRepository,
  postRepository,
  userRepository
);

const commentController = new CommentController(commentService);

const commentHandler = new CommentHandler();

const router = Router();

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
  // RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  commentHandler.getComments,
  commentController.getCommentsByPostId
);

router.get(
  "/:id",
  // RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
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
