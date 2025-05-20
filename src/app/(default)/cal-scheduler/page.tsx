import { redirect } from "next/navigation";
import { requireServerAuth } from "~/lib/auth-utils";
import { fetchCalAccessToken } from "~/app/api/cal-scheduler/actions";
import Link from "next/link";
import { Button } from "~/components/ui/button";

const CAL_COM_UI_URL = process.env.CAL_COM_UI_URL!;

export default async function CalSchedulerPage() {
  // 1) Auth + email verification
  const session = await requireServerAuth();
  const user = session.user;
  if (!user.emailVerified) {
    redirect("/email-verification");
  }

  // 2) Get a fresh Cal.com access token
  let accessToken: string;
  try {
    accessToken = await fetchCalAccessToken(user.id, user.email, user.name ?? user.email);
  } catch (err) {
    console.error(err);
  }

  // 3) Render a normal Next.js link
  const href = `${CAL_COM_UI_URL}/auth/login?access_token=${encodeURIComponent(accessToken)}`;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href={href} replace>
        <Button>Go to Mentor Dashboard</Button>
      </Link>
    </div>
  );
}
