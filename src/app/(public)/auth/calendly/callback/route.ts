import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { calendlyTokens } from "~/server/db/schema";
import { requireServerAuth } from "~/lib/auth-utils";

const CALENDLY_ID = env.CALENDLY_ID;
const CALENDLY_SECRET = env.CALENDLY_SECRET;
const REDIRECT_URI = env.NEXT_PUBLIC_BASE_URL + "/auth/calendly/callback";

export async function GET(request: NextRequest) {
  await requireServerAuth();
  // Extract code and state from URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This is the user ID

  if (!code || !state) {
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/schedule?error=missing_params`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CALENDLY_ID}:${CALENDLY_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Calendly token error:", error);
      return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/schedule?error=token_error`);
    }

    const tokenData = await tokenResponse.json();

    // Fetch user details from Calendly
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    let calendlyName = null;
    let calendlyEmail = null;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      calendlyName = userData.resource.name;
      calendlyEmail = userData.resource.email;
    }

    // Store tokens and user info in database
    await db.insert(calendlyTokens).values({
      userId: state,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      calendlyName,
      calendlyEmail,
    }).onConflictDoUpdate({
      target: [calendlyTokens.userId],
      set: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        calendlyName,
        calendlyEmail,
        updatedAt: new Date(),
      }
    });

    // Redirect back to schedule page
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/schedule?success=true`);
  } catch (error) {
    console.error("Calendly callback error:", error);
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/schedule?error=server_error`);
  }
}
