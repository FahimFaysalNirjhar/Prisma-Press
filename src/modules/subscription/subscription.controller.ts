import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const createCheckOutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionService.generateCheckoutSession(
      userId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Checkout completed successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.get("stripe-signature");

  console.log("🔥 Stripe webhook received");
  console.log("Is Buffer:", Buffer.isBuffer(req.body));
  console.log("Has signature:", Boolean(signature));

  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  try {
    await subscriptionService.handleWebhook(req.body as Buffer, signature);
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  return res.status(200).json({
    received: true,
  });
});

const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionService.getSubscriptionStatus(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Subscription status retrived successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  createCheckOutSession,
  handleWebhook,
  getSubscriptionStatus,
};
