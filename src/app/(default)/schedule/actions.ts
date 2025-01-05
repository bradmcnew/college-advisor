"use server";

import { and, eq, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { meetings, availability } from "~/server/db/schema";
import {
  deleteAvailability,
  getAvailability,
  setAvailability,
} from "~/server/queries";
import { DayAvailability } from "~/app/types";

/**
 * Handles the availability submission by inserting the selected time ranges into the database.
 * @param payload Array of availability objects to be inserted.
 */
export async function submitAvailability(
  payload: {
    day: string;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
  }[],
) {
  const session = await auth();
  const mentorId = session?.userId;
  if (!mentorId) {
    throw new Error("Unauthorized.");
  }

  try {
    // Delete all existing availabilities for the mentor
    await deleteAvailability(mentorId);

    const formattedPayload = payload.map((item) => {
      // Create a Date object for the specific day
      const baseDate = new Date(item.day);

      // Parse the time strings
      const [startHour, startMinute] = item.startTime.split(":").map(Number);
      const [endHour, endMinute] = item.endTime.split(":").map(Number);

      // Create UTC dates for start and end times
      const startTime = new Date(
        Date.UTC(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          startHour,
          startMinute,
          0,
        ),
      );

      const endTime = new Date(
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
        mentorId: mentorId,
        day: item.day,
        startTime: startTime,
        endTime: endTime,
      } as DayAvailability;
    });

    await setAvailability(formattedPayload);
  } catch (error) {
    console.error("Failed to submit availability:", error);
    throw new Error("Failed to submit availability.");
  }
}
