"use server";

import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { calcomTokens } from "~/server/db/schema";
import { env } from "~/env";
import { requireServerAuth } from "~/lib/auth-utils";

const { CAL_COM_API_URL, CAL_COM_OAUTH_CLIENT_ID, CAL_COM_SECRET_KEY } = env;

// 1) Try to read a stored refresh token
async function getStoredRefreshToken(userId: string): Promise<string | null> {
  await requireServerAuth();
  const rec = await db.query.calcomTokens.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  return rec?.refreshToken ?? null;
}

// 2) Insert or update tokens
async function storeTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresAt: Date,
  refreshTokenExpiresAt: Date,
) {
  await requireServerAuth();
  const existing = await db.query.calcomTokens.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (existing) {
    await db
      .update(calcomTokens)
      .set({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(calcomTokens.userId, userId));
  } else {
    await db.insert(calcomTokens).values({
      userId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    });
  }
}

// 3) The main token-getter: refresh if possible, else list/create, then store
export async function fetchCalAccessToken(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  await requireServerAuth();

  try {
    // 1) Try rotating using stored refreshToken
    const storedRefreshToken = await getStoredRefreshToken(userId);
    if (storedRefreshToken) {
      const refreshRes = await fetch(
        `${CAL_COM_API_URL}/oauth/${CAL_COM_OAUTH_CLIENT_ID}/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cal-secret-key": CAL_COM_SECRET_KEY,
          },
          cache: "no-store",
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        },
      );
      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        await storeTokens(
          userId,
          refreshJson.data.accessToken,
          refreshJson.data.refreshToken,
          new Date(refreshJson.data.accessTokenExpiresAt),
          new Date(refreshJson.data.refreshTokenExpiresAt),
        );
        return refreshJson.data.accessToken;
      }
      console.warn(
        `Cal.com token refresh failed (${refreshRes.status}), falling back to force-refresh`,
      );
    }

    // 2) List managed users to get calUserId
    const listRes = await fetch(
      `${CAL_COM_API_URL}/oauth-clients/${CAL_COM_OAUTH_CLIENT_ID}/users?email=${encodeURIComponent(email)}`,
      {
        headers: { "x-cal-secret-key": CAL_COM_SECRET_KEY },
        cache: "no-store",
      },
    );

    let listJson = null;
    const contentType = listRes.headers.get("content-type") ?? "";
    if (listRes.ok && contentType.includes("application/json")) {
      try {
        listJson = await listRes.json();
      } catch (e) {
        console.warn(
          "Cal.com list-users returned invalid JSON, falling back to create",
          e
        );
      }
    }

    if (listJson?.data && Array.isArray(listJson.data) && listJson.data.length > 0) {
      const calUserId = listJson.data[0].id;

      // 3) Force-refresh if needed
      const frRes = await fetch(
        `${CAL_COM_API_URL}/oauth-clients/${CAL_COM_OAUTH_CLIENT_ID}/users/${calUserId}/force-refresh`,
        {
          method: "POST",
          headers: { "x-cal-secret-key": CAL_COM_SECRET_KEY },
          cache: "no-store",
        },
      );
      if (!frRes.ok) {
        throw new Error(`Cal.com force-refresh failed: ${frRes.status}`);
      }
      const frJson = await frRes.json();
      await storeTokens(
        userId,
        frJson.data.accessToken,
        frJson.data.refreshToken,
        new Date(frJson.data.accessTokenExpiresAt),
        new Date(frJson.data.refreshTokenExpiresAt),
      );
      return frJson.data.accessToken;
    }

    // 4) Create a new managed user if none found
    const createRes = await fetch(
      `${CAL_COM_API_URL}/oauth-clients/${CAL_COM_OAUTH_CLIENT_ID}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cal-secret-key": CAL_COM_SECRET_KEY,
        },
        cache: "no-store",
        body: JSON.stringify({ email, name }),
      },
    );
    console.log("createRes", createRes);
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(
        `Cal.com create-user failed: ${createRes.status} ${err.error?.message ?? ""}`,
      );
    }
    const createJson = await createRes.json();
    await storeTokens(
      userId,
      createJson.data.accessToken,
      createJson.data.refreshToken,
      new Date(createJson.data.accessTokenExpiresAt),
      new Date(createJson.data.refreshTokenExpiresAt),
    );
    return createJson.data.accessToken;
  } catch (error) {
    console.error("Error fetching Cal.com access token:", error);
    throw error;
  }
}
