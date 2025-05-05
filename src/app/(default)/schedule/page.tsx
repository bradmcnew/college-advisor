import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import CalendlyWidget from "./CalendlyWidget";
import { db } from "~/server/db";
import { calendlyTokens } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SchedulePage() {
  const user = await auth();

  if (!user) {
    redirect("/");
  }

  // Check if user has connected their Calendly account
  const userToken = await db.query.calendlyTokens.findFirst({
    where: eq(calendlyTokens.userId, user.userId),
  });

  const hasCalendlyAccess = !!userToken;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 pt-16 text-2xl font-bold">Set Your Availability</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
        <h2 className="mb-4 text-xl font-semibold">Manage Your Availability with Calendly</h2>

        <p className="mb-4 text-muted-foreground">
          We use Calendly to manage mentor availability. Please follow these steps:
        </p>

        <ol className="mb-6 list-decimal space-y-2 pl-5">
          <li>Connect your Calendly account using the button below</li>
          <li>Once connected, you can view and manage your availability</li>
          <li>Students will be able to book appointments based on your availability</li>
        </ol>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          {!hasCalendlyAccess ? (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/api/calendly/auth">
                Connect Calendly Account
              </a>
            </Button>
          ) : (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a
                href="https://calendly.com/app/availability"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Calendly Availability
              </a>
            </Button>
          )}

          <Link href="/dashboard">
            <Button variant="outline">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendly Widget for availability */}
      <CalendlyWidget userId={user.userId} hasCalendlyAccess={hasCalendlyAccess} />
    </div>
  );
}
