import { Suspense } from "react";
import { redirect } from "next/navigation";
import ScheduleForm from "~/app/schedule/ScheduleForm";
import { auth } from "~/server/auth";
import Loading from "~/app/view-profile/loading";

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
      <Suspense fallback={<Loading />}>
        <ScheduleForm mentorId={user.userId} />
      </Suspense>
    </div>
  );
}
