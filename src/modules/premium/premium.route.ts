import { Router } from "express";
import { auth } from "../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { premiumController } from "./premium.controller";
import { subscriptionGuard } from "../middlewares/subscriptionGurad";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionGuard(),
  premiumController.getPremiumContent,
);

router.get(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionGuard(),
  premiumController.getPremiumPostById,
);

export const premiumRouter = router;
