import { Router } from "express";
import PostController from "../controllers/PostController";
import { uploadFile } from "../middlewares/storeFile";
import PostHandler from "../handlers/PostHandler";

const router = Router();
const postController = new PostController();
const postHandler = new PostHandler();

router.post(
  "/",
  uploadFile.fields([
    { name: "postAttachments" },
    { name: "postThumbnail", maxCount: 1 },
  ]),
  postHandler.createPost,
  postController.createPost
);

router.put(
  "/:id",
  uploadFile.fields([
    { name: "postAttachments" },
    { name: "postThumbnail", maxCount: 1 },
  ]),
  postHandler.updatePost,
  postController.updatePost
);

router.get("/", postHandler.getPosts, postController.getPosts);
router.get("/:id", postHandler.getPost, postController.getPost);
router.delete("/:id", postHandler.deletePost, postController.deletePost);

export default router;
