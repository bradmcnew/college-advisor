import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { env } from "~/env";
import VerificationResult from "~/app/(verify)/verify-email/VerificationResult";
import { userProfiles } from "~/server/db/schema";

interface VerificationPageProps {
  searchParams: { token?: string };
}

export default async function VerificationPage({
  searchParams,
}: VerificationPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <VerificationResult success={false} message="Invalid or missing token." />
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      eduEmail: string;
    };

    const { userId, eduEmail } = decoded;

    // Upsert the user profile with the verified email
    await db
      .insert(userProfiles)
      .values({
        userId,
        eduEmail,
        isEduVerified: true,
        isMentor: true,
        bio: "",
        schoolYear: "Freshman",
        graduationYear: new Date().getFullYear() + 4,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          eduEmail,
          isEduVerified: true,
          isMentor: true,
        },
      });

    // Pass success to the client component
    return (
      <VerificationResult
        success={true}
        message="Email verified successfully!"
      />
    );
  } catch (error: unknown) {
    console.error("Error verifying email:", error);
    return (
      <VerificationResult
        success={false}
        message="Verification failed. Please try again."
      />
    );
  }
}
