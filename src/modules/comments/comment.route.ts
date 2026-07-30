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

export const commentRouter = router;
