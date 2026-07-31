import { Router } from "express";
import { commentController } from "./comment.controller";
import { auth } from "../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.createComment,
);

router.get("/author/:authorId", commentController.getCommentByAuthorId);

router.get("/:commentId", commentController.getCommentByCommentId);

router.patch(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.updateComment,
);

router.patch(
  "/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.moderateComment,
);

router.delete(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.deleteComment,
);
export const commentRouter = router;
