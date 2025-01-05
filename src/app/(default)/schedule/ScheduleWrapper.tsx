import ScheduleForm from "~/app/(default)/schedule/ScheduleForm";
import { getAvailability } from "~/server/queries";

interface ScheduleWrapperProps {
  mentorId: string;
}

export default async function ScheduleWrapper({
  mentorId,
}: ScheduleWrapperProps) {
  const availabilities = await getAvailability(mentorId);
  const initialAvailabilities = availabilities.map((avail) => ({
    day: avail.day,
    startTime: avail.startTime.toISOString(),
    endTime: avail.endTime.toISOString(),
  }));

  return (
    <ScheduleForm
      mentorId={mentorId}
      initialAvailabilities={initialAvailabilities}
    />
  );
}
