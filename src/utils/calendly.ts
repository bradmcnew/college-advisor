import { db } from "~/server/db";
import { calendlyTokens } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID!;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET!;

export async function getValidAccessToken(userId: string) {
  // Get the user's tokens
  const userTokens = await db.query.calendlyTokens.findFirst({
    where: eq(calendlyTokens.userId, userId),
  });

  if (!userTokens) {
    return null; // User hasn't connected Calendly
  }

  // Check if token is expired
  if (new Date() > userTokens.expiresAt) {
    // Refresh token
    try {
      const tokenResponse = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${CALENDLY_CLIENT_ID}:${CALENDLY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: userTokens.refreshToken,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const tokenData = await tokenResponse.json();

      // Update tokens in database
      const updatedTokens = await db
        .update(calendlyTokens)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(eq(calendlyTokens.userId, userId))
        .returning();

      return updatedTokens[0]?.accessToken ?? null;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  // Token is still valid
  return userTokens.accessToken;
}

// Fetch user availability from Calendly
export async function fetchUserAvailability(userId: string) {
  const accessToken = await getValidAccessToken(userId);

  if (!accessToken) {
    return null;
  }

  try {
    // First get the user's Calendly URI
    const userResponse = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Calendly user");
    }

    const userData = await userResponse.json();
    const userUri = userData.resource.uri;

    // Then fetch user availability schedules
    const availabilityResponse = await fetch(`https://api.calendly.com/user_availability_schedules?user=${userUri}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!availabilityResponse.ok) {
      throw new Error("Failed to fetch availability schedules");
    }

    const availabilityData = await availabilityResponse.json();

    return availabilityData;
  } catch (error) {
    console.error("Availability fetch error:", error);
    return null;
  }
}
