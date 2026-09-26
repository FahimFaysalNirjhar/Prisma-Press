import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/register", userController.registerUser);

router.get(
  "/me",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.updateMyProfile,
);

router.post(
  "/author-requests", // ← still missing the leading slash in your pasted code, fixed here
  auth(Role.USER),
  userController.createAuthorRequest,
);

router.get(
  "/author-requests/me",
  auth(Role.USER),
  userController.getMyAuthorRequest,
);

router.get(
  "/author-requests",
  auth(Role.ADMIN),
  userController.getAllAuthorRequests,
);

router.patch(
  "/author-requests/:id",
  auth(Role.ADMIN),
  userController.reviewAuthorRequest,
);

export const userRouter = router;
