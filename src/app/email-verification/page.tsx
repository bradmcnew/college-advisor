import { redirect } from "next/navigation";
import SentEmailVerification from "~/app/email-verification/Sent";
import EmailInputForm from "~/app/email-verification/EmailInputForm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import StatusToast from "../components/StatusToast";
import { getProfile } from "~/server/queries";

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
