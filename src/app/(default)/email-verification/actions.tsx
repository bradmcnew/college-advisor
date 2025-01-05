"use server";

import { auth } from "~/server/auth";
import { getProfile } from "~/server/queries";

export async function checkVerificationStatus(): Promise<boolean> {
  const session = await auth();

  if (!session) {
    throw new Error("User not authenticated.");
  }

  const userProfile = await getProfile();

  return userProfile?.isEduVerified ?? false;
}
