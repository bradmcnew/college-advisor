"use server";

import { auth } from "~/server/auth";
import { DayAvailability } from "~/app/types";
import { deleteAvailability, setAvailability } from "~/server/queries";

/**
 * Handles the availability submission by inserting the selected time ranges into the database.
 * @param payload Array of availability objects to be inserted.
 */
export async function submitAvailability(
  payload: {
    day: string;
    startTime: string;
    endTime: string;
  }[],
) {
  console.log("payload", payload);
  const session = await auth();
  const mentorId = session?.userId;
  if (!mentorId) {
    throw new Error("Unauthorized.");
  }

  try {
    // Delete all existing availabilities for the mentor
    await deleteAvailability(mentorId);

    const formattedPayload = payload.map((item) => {
      // Parse the full UTC ISO strings
      const startDateTime = new Date(item.startTime);
      const endDateTime = new Date(item.endTime);

      return {
        mentorId: mentorId,
        day: item.day,
        startTime: startDateTime,
        endTime: endDateTime,
      } as DayAvailability;
    });

    await setAvailability(formattedPayload);
  } catch (error) {
    console.error("Failed to submit availability:", error);
    throw new Error("Failed to submit availability.");
  }
}
