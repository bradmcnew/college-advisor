import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import RootLoading from "~/app/(default)/loading";
import ScheduleWrapper from "~/app/(default)/schedule/ScheduleWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SchedulePage() {
  const user = await auth();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 pt-16 text-2xl font-bold">Set Your Availability</h1>
      <Suspense fallback={<RootLoading />}>
        <ScheduleWrapper mentorId={user.userId} />
      </Suspense>
    </div>
  );
}
