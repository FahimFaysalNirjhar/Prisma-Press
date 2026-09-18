import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";
import {
  handleChangeSubscription,
  handleCheckoutCompleted,
} from "./subscription.utils";

const generateCheckoutSession = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { subscription: true },
  });

  let stripeCustomerId = user.subscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: config.stripe_product_price_id,
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    success_url: `${config.app_url}/premium?success=true`,
    cancel_url: `${config.app_url}/payment?success=false`,
    metadata: {
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
  });

  console.log("========== CHECKOUT SESSION CREATED ==========");
  console.log("User ID:", user.id);
  console.log("Stripe Customer ID:", stripeCustomerId);
  console.log("Session ID:", session.id);
  console.log("Session Metadata:", session.metadata);
  console.log("Session Customer:", session.customer);
  console.log("Session Subscription:", session.subscription);
  console.log("Payment URL:", session.url);

  return {
    paymentUrl: session.url,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret as string,
  );

  console.log("Webhook secret exists:", !!config.stripe_webhook_secret);
  console.log(
    "Webhook secret prefix:",
    config.stripe_webhook_secret?.slice(0, 10),
  );
  console.log("Signature prefix:", signature?.slice(0, 20));
  console.log("Payload is Buffer:", Buffer.isBuffer(payload));

  switch (event.type) {
    case "checkout.session.completed":
      //   const paymentIntent = event.data.object;
      //   console.log(event.data.object);

      await handleCheckoutCompleted(event.data.object);

      break;
    case "customer.subscription.updated":
      //   const paymentMethod = event.data.object;

      await handleChangeSubscription(event.data.object);

      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;

    case "customer.subscription.deleted":
      await handleChangeSubscription(event.data.object);
      break;
    default:
      // Unexpected event type
      console.log(`No events matched. Unhandled event type ${event.type}.`);
      break;
  }
};

const getSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // Must come before any subscription.status access
  if (!subscription) {
    return {
      status: null,
      isSubscribed: false,
      currentPeriodEnd: null,
    };
  }

  const isActive = Boolean(
    subscription.status === "ACTIVE" &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) > new Date(),
  );

  return {
    status: subscription.status,
    isSubscribed: isActive,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
};
// test command stripe subscriptions cancel subcriptionId

export const subscriptionService = {
  generateCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
};
