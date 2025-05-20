import SentEmailVerification from "~/app/(default)/email-verification/Sent";
import EmailInputForm from "~/app/(default)/email-verification/EmailInputForm";
import StatusToast from "~/app/components/StatusToast";
import { getProfile } from "~/server/queries";
import { requireAuth } from "~/lib/auth-utils";

interface EmailVerificationPageProps {
  searchParams: { status?: string };
}

export default async function EmailVerificationPage({
  searchParams,
}: EmailVerificationPageProps) {
  const { userId } = await requireAuth();

  const { status } = await searchParams;

  // Fetch the user's profile to determine if they have an existing eduEmail
  const isVerified = (await getProfile(userId))?.isEduVerified;

  // Render the SentEmailVerification component if the status is 'sent'
  if (status === "sent") {
    return <SentEmailVerification />;
  }

  // Render the EmailInputForm with the appropriate message and success flag
  return (
    <>
      <EmailInputForm isVerified={isVerified} />
      <StatusToast status={status || null} />
    </>
  );
}
