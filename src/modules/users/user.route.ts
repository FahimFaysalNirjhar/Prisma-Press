import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../middlewares/auth";

const router = Router();

router.post("/register", userController.registerUser);

declare global {
  namespace Express {
    interface Request {
      user?: { email: string; name: string; id: string; role: Role };
    }
  }
}

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

export const userRouter = router;
