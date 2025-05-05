import { NextResponse } from "next/server";
import { stripe } from "~/lib/server-utils";

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
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

      return NextResponse.json({ account: account.id });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Stripe account creation error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
