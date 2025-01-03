"use server";

import { db } from "~/server/db";
import { meetings } from "~/server/db/schema";

/**
 * Handles the schedule submission by inserting the selected time blocks into the database.
 * @param payload Array of meeting objects to be inserted.
 */
export async function submitSchedule(
  payload: {
    mentor_id: string;
    mentee_id: string | null;
    scheduled_time: string;
    meeting_url: string;
    status: string;
  }[],
) {
  try {
    const formattedPayload = payload.map((item) => ({
      ...item,
      scheduled_time: new Date(item.scheduled_time), // Convert string to Date
    }));
    console.log(formattedPayload);

    await db.insert(meetings).values(formattedPayload);
  } catch (error) {
    console.error("Failed to submit schedule:", error);
    throw new Error("Failed to submit schedule.");
  }
}
