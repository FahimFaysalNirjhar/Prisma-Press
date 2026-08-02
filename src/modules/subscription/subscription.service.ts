import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const generateCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { subscription: true },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        metadata: { userId: user?.id },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    return session.url;
  });
  return { paymentUrl: transactionResult };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret as string,
  );

  switch (event.type) {
    case "checkout.session.completed":
      //   const paymentIntent = event.data.object;
      console.log(event.data.object);

      break;
    case "customer.subscription.updated":
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;

    case "customer.subscription.deleted":
      break;
    default:
      // Unexpected event type
      console.log(`No events matched. Unhandled event type ${event.type}.`);
      break;
  }
};

export const subscriptionService = { generateCheckoutSession, handleWebhook };
