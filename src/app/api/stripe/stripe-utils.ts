import { db } from "~/server/db";
import { stripeAccounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireServerAuth } from "~/lib/auth-utils";

/**
 * Creates a record for a Stripe connected account in the database
 */
export async function createStripeAccount(userId: string, stripeAccountId: string) {
  await requireServerAuth();
  try {
    const result = await db.insert(stripeAccounts).values({
      userId,
      stripeAccountId,
      onboardingComplete: false,
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Failed to create Stripe account record:", error);
    throw error;
  }
}

/**
 * Updates the onboarding status for a Stripe account
 */
export async function updateStripeAccountOnboardingStatus(
  stripeAccountId: string,
  onboardingComplete: boolean
) {
  await requireServerAuth();
  try {
    const result = await db
      .update(stripeAccounts)
      .set({
        onboardingComplete,
        updatedAt: new Date()
      })
      .where(eq(stripeAccounts.stripeAccountId, stripeAccountId))
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to update Stripe account onboarding status:", error);
    throw error;
  }
}

/**
 * Gets the Stripe account for a user
 */
export async function getStripeAccountByUserId(userId: string) {
  await requireServerAuth();
  try {
    return await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, userId)
    });
  } catch (error) {
    console.error("Failed to get Stripe account:", error);
    throw error;
  }
}
