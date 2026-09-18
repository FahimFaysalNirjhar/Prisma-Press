import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const subscriptionGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    console.log("User ID:", userId);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    console.log("Subscription:", subscription);

    if (!subscription) {
      throw new Error("Please subscribe to get access to premium content");
    }

    const isActive =
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) > new Date();

    if (!isActive) {
      throw new Error("Your subscription has expired");
    }

    next();
  });
};
