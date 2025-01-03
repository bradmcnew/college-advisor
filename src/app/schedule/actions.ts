"use server";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { meetings, availability } from "~/server/db/schema";

/**
 * Handles the schedule submission by inserting the selected meetings into the database.
 * @param payload Array of meeting objects to be inserted.
 */
export async function submitSchedule(
  payload: {
    mentor_id: string;
    mentee_id: string | null;
    start_time: string;
    end_time: string;
    meeting_url: string;
    status: string;
  }[],
) {
  try {
    const formattedPayload = payload.map((item) => ({
      mentor_id: item.mentor_id,
      mentee_id: item.mentee_id,
      start_time: new Date(item.start_time), // Convert string to Date
      end_time: new Date(item.end_time), // Convert string to Date
      meeting_url: item.meeting_url,
      status: item.status,
    }));

    await db.insert(meetings).values(formattedPayload);
  } catch (error) {
    console.error("Failed to submit schedule:", error);
    throw new Error("Failed to submit schedule.");
  }
}

/**
 * Handles the availability submission by inserting the selected time ranges into the database.
 * @param payload Array of availability objects to be inserted.
 */
export async function submitAvailability(
  payload: {
    mentor_id: string;
    day: string;
    start_time: string;
    end_time: string;
  }[],
) {
  try {
    const formattedPayload = payload.map((item) => ({
      mentor_id: item.mentor_id,
      day: item.day,
      start_time: new Date(item.start_time),
      end_time: new Date(item.end_time),
    }));

    await db.insert(availability).values(formattedPayload);
  } catch (error) {
    console.error("Failed to submit availability:", error);
    throw new Error("Failed to submit availability.");
  }
}
