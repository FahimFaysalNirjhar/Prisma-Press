import { Router } from "express";
import { auth } from "../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { subscriptionController } from "./subscription.controller";

const router = Router();

router.post(
  "/checkout",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionController.createCheckOutSession,
);

router.post("/webhook", subscriptionController.handleWebhook);

export const subscriptionRouter = router;
