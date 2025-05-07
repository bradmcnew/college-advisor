import { NextResponse } from "next/server";
import { stripe } from "~/lib/server-utils";
import { getStripeAccountByUserId } from "../stripe-utils";
import { requireServerAuth } from "~/lib/auth-utils";

/**
 * Creates a SetupIntent for saving a payment method without charging
 */
export async function POST(req: Request) {
  try {
    const session = await requireServerAuth();

    // Get the mentor's Stripe account from your database
    const mentorAccount = await req.json();
    const { mentorId } = mentorAccount;

    if (!mentorId) {
      return NextResponse.json({ error: "Mentor ID is required" }, { status: 400 });
    }

    // Get the mentor's Stripe account ID
    const mentorStripeAccount = await getStripeAccountByUserId(mentorId);

    if (!mentorStripeAccount) {
      return NextResponse.json({ error: "Mentor has not set up payments yet" }, { status: 400 });
    }

    if (!mentorStripeAccount.onboardingComplete) {
      return NextResponse.json({ error: "Mentor has not completed payment setup" }, { status: 400 });
    }

    // Create a customer for the current user if they don't have one
    // In a real app, you'd want to store and reuse customer IDs
    const customerName = session!.user.name || "Unknown User";
    const customerEmail = session!.user.email || undefined;

    const customer = await stripe.customers.create({
      name: customerName,
      email: customerEmail,
      metadata: {
        userId: session!.user.id,
      }
    });

    // Create a SetupIntent on behalf of the connected account
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session', // This allows you to use the payment method for future payments
    }, {
      stripeAccount: mentorStripeAccount.stripeAccountId,
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Setup intent creation error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
