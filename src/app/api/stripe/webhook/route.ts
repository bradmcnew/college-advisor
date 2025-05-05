import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from "~/env";
import { stripe } from "~/lib/server-utils";
import { updateStripeAccountOnboardingStatus } from "../stripe-utils";
import type Stripe from "stripe";

/**
 * Stripe webhook handler
 */
export async function POST(req: Request) {
  console.log("====== Stripe Webhook Received ======");
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    console.log("Stripe-Signature:", signature ? "Present" : "Missing");

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature ?? "",
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", {
        message: error.message,
        signature: signature ?? "missing",
        secretUsed: env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + "..." // Just show first few chars
      });
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Handle specific events
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        // Check if capabilities indicate onboarding is complete
        const isOnboardingComplete =
          account.capabilities?.card_payments === "active" &&
          account.capabilities?.transfers === "active";

        // Update account status in our database
        if (isOnboardingComplete) {
          await updateStripeAccountOnboardingStatus(account.id, true);
          console.log(`Onboarding completed for account ${account.id}`);
        }

        break;
      }

      // Handle other event types as needed
      // case "payment_intent.succeeded":
      // case "payment_intent.payment_failed":

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Note: We need to disable Next.js body parsing for webhooks
export const config = {
  // Just use the empty default Next.js API route config
};
