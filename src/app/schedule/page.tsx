import ScheduleForm from "~/app/schedule/ScheduleForm";

/**
 * Server Component for the Schedule Page.
 */
export default function SchedulePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Set Your Availability</h1>
      <ScheduleForm />
    </div>
  );
}
