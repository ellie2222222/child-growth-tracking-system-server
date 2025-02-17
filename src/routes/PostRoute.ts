import { Router } from "express";
import PostController from "../controllers/PostController";
import { uploadFile } from "../middlewares/storeFile";
import PostHandler from "../handlers/PostHandler";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();
const postController = new PostController();
const postHandler = new PostHandler();

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER]),
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
  "/post-status/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  postHandler.updatePostStatus,
  postController.updatePostStatus
);

router.get(
  "/",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  postHandler.getPosts,
  postController.getPosts
);

router.get(
  "/by-userId",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  postHandler.getPostsByUserId,
  postController.getPostsByUserId
);
router.get(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  postHandler.getPost,
  postController.getPost
);

router.delete(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  postHandler.deletePost,
  postController.deletePost
);

export default router;
