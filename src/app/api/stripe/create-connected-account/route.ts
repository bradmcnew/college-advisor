import { NextResponse } from "next/server";
import { stripe } from "~/lib/server-utils";
import { auth } from "~/server/auth";
import { createStripeAccount, getStripeAccountByUserId } from "../stripe-utils";
import { env } from "~/env";
import { headers } from "next/headers";

/**
 * Creates a Stripe connected account and returns an account link URL
 * for immediate onboarding
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check if the user already has a Stripe account
    const existingAccount = await getStripeAccountByUserId(session.user.id);
    let accountId;
    let isExisting = false;

    if (existingAccount) {
      // User already has an account, use the existing one
      accountId = existingAccount.stripeAccountId;
      isExisting = true;
    } else {
      // Create a new Stripe connected account
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        settings: {
          payouts: {
            schedule: {
              interval: "manual",
            },
          },
        },
      });

      // Save the account in our database
      await createStripeAccount(session.user.id, account.id);
      accountId = account.id;
    }

    // Create an account link for onboarding
    const headersList = await headers();
    const origin = headersList.get("origin") || env.NEXT_PUBLIC_BASE_URL;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/booking/payment/refresh/${accountId}`,
      return_url: `${origin}/booking/payment/return/${accountId}`,
      type: "account_onboarding",
    });

    // Return both the account ID and the onboarding URL
    return NextResponse.json({
      account: accountId,
      url: accountLink.url,
      isExisting,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Stripe account creation error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
