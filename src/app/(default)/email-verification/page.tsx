import SentEmailVerification from "~/app/(default)/email-verification/Sent";
import EmailInputForm from "~/app/(default)/email-verification/EmailInputForm";
import { auth } from "~/server/auth";
import StatusToast from "~/app/components/StatusToast";
import { getProfile } from "~/server/queries";
import { redirect } from "next/navigation";

interface EmailVerificationPageProps {
  searchParams: { status?: string };
}

export default async function EmailVerificationPage({
  searchParams,
}: EmailVerificationPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { status } = await searchParams;

  // Fetch the user's profile to determine if they have an existing eduEmail
  const isVerified = (await getProfile())?.isEduVerified;

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
