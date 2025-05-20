"use server";

import { requireAuth } from "~/lib/auth-utils";
import { getProfile } from "~/server/queries";

export async function checkVerificationStatus(): Promise<boolean> {
  const { userId } = await requireAuth();

  const userProfile = await getProfile(userId);

  return userProfile?.isEduVerified ?? false;
}
