import { env } from "~/env";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "~/lib/server-utils";

export async function POST(req: Request) {
  try {
    const { account } = await req.json();

    if (!account) {
      return NextResponse.json(
        { error: "Connected account ID is required" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || env.NEXT_PUBLIC_BASE_URL;

    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${origin}/booking/payment/refresh/${account}`,
      return_url: `${origin}/booking/payment/return/${account}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Stripe account link creation error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
