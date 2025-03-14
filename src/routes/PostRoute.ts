import { Router } from "express";

import { uploadFile } from "../middlewares/storeFile";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import PostHandler from "../handlers/PostHandler";
import PostController from "../controllers/PostController";
import PostService from "../services/PostService";
import UserRepository from "../repositories/UserRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import PostRepository from "../repositories/PostRepository";
import validateMembership from "../middlewares/MembershipMiddleware";

const userRepository = new UserRepository();
const membershipPackageRepository = new MembershipPackageRepository();
const postRepository = new PostRepository();

const postService = new PostService(
  postRepository,
  userRepository,
  membershipPackageRepository
);

const postController = new PostController(postService);
const postHandler = new PostHandler();

const router = Router();

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER]),
  validateMembership("postLimit"),
  uploadFile.fields([
    { name: "postAttachments" },
    { name: "postThumbnail", maxCount: 1 },
  ]),
  postHandler.createPost,
  postController.createPost
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER]),
  uploadFile.fields([
    { name: "postAttachments" },
    { name: "postThumbnail", maxCount: 1 },
  ]),
  postHandler.updatePost,
  postController.updatePost
);

router.put(
  "/status/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  postHandler.updatePostStatus,
  postController.updatePostStatus
);

router.get("/", postHandler.getPosts, postController.getPosts);

router.get(
  "/users/:id",
  postHandler.getPostsByUserId,
  postController.getPostsByUserId
);
router.get("/:id", postHandler.getPost, postController.getPost);

router.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  postHandler.deletePost,
  postController.deletePost
);

export default router;
