import { Router } from "express";
import PostController from "../controllers/PostController";
import { uploadFile } from "../middlewares/storeFile";

const router = Router();
const postController = new PostController();

router.post("/", uploadFile.array("createPosts"), postController.createPost);
router.put("/:id", uploadFile.array("updatePosts"), postController.updatePosts);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPost);
router.delete("/:id", postController.deletePost);
export default router;
