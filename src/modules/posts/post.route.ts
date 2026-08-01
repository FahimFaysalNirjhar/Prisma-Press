import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../middlewares/auth";
import { postController } from "./post.controller";

const router = Router();

// Create
router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.createPost,
);

// Read
router.get("/", postController.getAllPosts);

router.get(
  "/my-posts",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.getMyPosts,
);

router.get("/stats", auth(Role.ADMIN), postController.getPostsStats);
router.get("/:postId", postController.getPostById);

// Update
router.patch(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.updatePost,
);

// Delete
router.delete(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.deletePost,
);

export const postRouter = router;
