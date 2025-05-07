"use server";

import { requireAuth } from "~/lib/auth-utils";
import { getProfile } from "~/server/queries";

export async function checkVerificationStatus(): Promise<boolean> {
  await requireAuth();

  const userProfile = await getProfile();

  return userProfile?.isEduVerified ?? false;
}
