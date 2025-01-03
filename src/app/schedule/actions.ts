"use server";

import { and, eq, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
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
      start_time: new Date(item.start_time),
      end_time: new Date(item.end_time),
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
    day: string;
    start_time: string; // "HH:MM"
    end_time: string; // "HH:MM"
  }[],
) {
  const session = await auth();
  const mentorId = session?.userId;
  if (!mentorId) {
    throw new Error("Unauthorized.");
  }

  try {
    // Delete all existing availabilities for the mentor
    await db.delete(availability).where(eq(availability.mentor_id, mentorId));

    if (payload.length === 0) {
      console.log(`All availabilities deleted for mentor_id: ${mentorId}`);
      return;
    }

    const formattedPayload = payload.map((item) => {
      // Create a Date object for the specific day
      const baseDate = new Date(item.day);

      // Parse the time strings
      const [startHour, startMinute] = item.start_time.split(":").map(Number);
      const [endHour, endMinute] = item.end_time.split(":").map(Number);

      // Create UTC dates for start and end times
      const start_time = new Date(
        Date.UTC(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          startHour,
          startMinute,
          0,
        ),
      );

      const end_time = new Date(
        Date.UTC(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          endHour,
          endMinute,
          0,
        ),
      );

      return {
        mentor_id: mentorId,
        day: item.day,
        start_time,
        end_time,
      };
    });

    await db.insert(availability).values(formattedPayload);
  } catch (error) {
    console.error("Failed to submit availability:", error);
    throw new Error("Failed to submit availability.");
  }
}

/**
 * Fetches the availability for a given mentor and converts it to local time.
 * @param mentorId The ID of the mentor.
 * @returns An array of availability objects with local times.
 */
export async function getAvailability(mentorId: string) {
  try {
    const availabilities = await db
      .select()
      .from(availability)
      .where(eq(availability.mentor_id, mentorId));

    return availabilities.map((avail) => ({
      day: avail.day,
      startTime: avail.start_time.toISOString(),
      endTime: avail.end_time.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    throw new Error("Failed to fetch availability.");
  }
}
