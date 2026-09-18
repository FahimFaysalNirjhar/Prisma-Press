import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInMiLLSeconds =
    payload.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMiLLSeconds * 1000);
  return currentPeriodEnd;
};

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  console.log("========== CHECKOUT COMPLETED ==========");
  console.log("Session ID:", session.id);
  console.log("Metadata:", session.metadata);
  console.log("Customer:", session.customer);
  console.log("Subscription:", session.subscription);

  const userId = session.metadata?.userId;

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    console.log("Webhook: Missing values for creating subscription");
    return;
  }

  const stripeSubscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  console.log("Stripe Subscription ID:", stripeSubscription.id);
  console.log("Stripe Subscription Status:", stripeSubscription.status);

  const currentPeriodEnd = getPeriodEnd(stripeSubscription);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      currentPeriodEnd,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId,
      stripeSubscriptionId,
    },
    update: {
      currentPeriodEnd,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId,
      stripeSubscriptionId,
    },
  });

  console.log("✅ Subscription saved successfully");
};

export const handleChangeSubscription = async (
  payload: Stripe.Subscription,
) => {
  const stripeSubscriptionId = payload.id;
  const status =
    payload.status === "active" || payload.status === "trialing"
      ? SubscriptionStatus.ACTIVE
      : payload.status === "canceled"
        ? SubscriptionStatus.CANCELED
        : SubscriptionStatus.EXPIRED;

  const currentPeriodEnd = getPeriodEnd(payload);
  const isSubscriptionExist = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!isSubscriptionExist) {
    console.log(
      `Webhook: No Subscription found for subscription id: ${stripeSubscriptionId}`,
    );
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status,
      currentPeriodEnd,
    },
  });
};
