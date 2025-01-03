import { redirect } from "next/navigation";
import ScheduleForm from "~/app/schedule/ScheduleForm";
import { auth } from "~/server/auth"; // Assuming you have an auth utility

/**
 * Server Component for the Schedule Page.
 */
export default async function SchedulePage() {
  const user = await auth(); // Fetch the current user on the server

  // Redirect unauthenticated users to the homepage
  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Set Your Availability</h1>
      <ScheduleForm mentorId={user.userId} />
    </div>
  );
}
