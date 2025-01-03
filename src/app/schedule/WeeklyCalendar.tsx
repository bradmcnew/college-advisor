"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Label } from "~/components/ui/label";

/**
 * Interface representing a selected time range.
 */
interface TimeRange {
  day: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

/**
 * Props for the WeeklyCalendar component.
 */
interface WeeklyCalendarProps {
  selectedRanges: TimeRange[];
  onChange: (ranges: TimeRange[]) => void;
}

/**
 * Array representing hours from 7 AM to 11 PM.
 */
const HOURS = Array.from({ length: 17 }, (_, i) => 7 + i); // 7 AM to 11 PM

/**
 * Converts 24-hour time to 12-hour format with AM/PM.
 * @param hour The hour in 24-hour format.
 * @returns A string representing the time in 12-hour format.
 */
const formatHour = (hour: number): string => {
  const period = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${adjustedHour}:00 ${period}`;
};

/**
 * Checks if two time ranges are adjacent.
 * @param range1 The first time range.
 * @param range2 The second time range.
 * @returns A boolean indicating if the two ranges are adjacent.
 */
const areAdjacent = (range1: TimeRange, range2: TimeRange): boolean => {
  if (range1.day.toDateString() !== range2.day.toDateString()) return false;

  const range1End = parseInt(range1.endTime.split(":")[0] ?? "0", 10);
  const range2Start = parseInt(range2.startTime.split(":")[0] ?? "0", 10);

  return range1End === range2Start;
};

/**
 * Merges overlapping or adjacent time ranges within the same day.
 * @param ranges The array of time ranges to merge.
 * @returns A new array of merged time ranges.
 */
const mergeRanges = (ranges: TimeRange[]): TimeRange[] => {
  if (ranges.length === 0) return [];

  // Group ranges by day
  const rangesByDay = ranges.reduce(
    (acc, range) => {
      const dateString = range.day.toDateString();
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(range);
      return acc;
    },
    {} as Record<string, TimeRange[]>,
  );

  // Process each day's ranges separately
  const mergedRanges: TimeRange[] = [];

  Object.values(rangesByDay).forEach((dayRanges) => {
    // Sort ranges within each day by start time
    const sorted = [...dayRanges].sort(
      (a, b) =>
        parseInt(a.startTime.split(":")[0] ?? "0", 10) -
        parseInt(b.startTime.split(":")[0] ?? "0", 10),
    );

    let current = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      if (
        current &&
        next &&
        (areAdjacent(current, next) ||
          parseInt(next.startTime.split(":")[0] ?? "0", 10) <
            parseInt(current.endTime.split(":")[0] ?? "0", 10))
      ) {
        // Merge the two ranges
        current.endTime =
          Math.max(
            parseInt(current.endTime.split(":")[0] ?? "0", 10),
            parseInt(next.endTime.split(":")[0] ?? "0", 10),
          ) + ":00";
      } else {
        if (current) mergedRanges.push(current);
        current = next;
      }
    }
    if (current) mergedRanges.push(current);
  });

  return mergedRanges;
};

/**
 * WeeklyCalendar Component
 * Renders an interactive weekly calendar allowing users to select and remove time ranges by clicking and dragging.
 */
export default function WeeklyCalendar({
  selectedRanges,
  onChange,
}: WeeklyCalendarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    day: Date;
    hour: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: Date; hour: number } | null>(
    null,
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  /**
   * Handles the initiation of a drag action.
   * @param day The day being selected.
   * @param hour The hour being selected.
   */
  const handleMouseDown = (day: Date, hour: number) => {
    // Check if the clicked cell is already part of a selected range
    const existingRange = selectedRanges.find(
      (range) =>
        range.day.toDateString() === day.toDateString() &&
        hour >= parseInt(range.startTime.split(":")[0] ?? "0", 10) &&
        hour < parseInt(range.endTime.split(":")[0] ?? "0", 10),
    );

    if (existingRange) {
      // Remove the entire range
      const updatedRanges = selectedRanges.filter(
        (range) => range !== existingRange,
      );
      onChange(updatedRanges);
      return;
    }

    // Initiate new selection
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
  };

  /**
   * Updates the drag end position as the user drags over cells.
   * @param day The day being hovered.
   * @param hour The hour being hovered.
   */
  const handleMouseEnter = (day: Date, hour: number) => {
    if (
      isDragging &&
      dragStart &&
      day.toDateString() === dragStart.day.toDateString()
    ) {
      setDragEnd({ day, hour });
    }
  };

  /**
   * Finalizes the drag action, calculates the selected range, merges ranges if necessary, and updates the state.
   */
  const handleMouseUp = useCallback(() => {
    if (dragStart && dragEnd) {
      const startDay = dragStart.day;
      const endDay = dragEnd.day;
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;

      // Ensure selection is within the same day
      if (startDay.toDateString() !== endDay.toDateString()) {
        // Handle multi-day selections if needed
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      const newRange: TimeRange = {
        day: startDay,
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(endHour).padStart(2, "0")}:00`,
      };

      // Merge the new range with existing ranges if adjacent or overlapping
      const updatedRanges = [...selectedRanges, newRange];
      const mergedRanges = mergeRanges(updatedRanges);

      onChange(mergedRanges);

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    }
  }, [dragStart, dragEnd, onChange, selectedRanges]);

  /**
   * Adds global mouseup listener to handle drag completion outside the calendar area.
   */
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => {
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [isDragging, handleMouseUp]);

  /**
   * Determines if a specific day-hour cell is selected.
   * @param day The day of the cell.
   * @param hour The hour of the cell.
   * @returns A boolean indicating if the cell is selected.
   */
  const isCellSelected = (day: Date, hour: number): boolean => {
    return selectedRanges.some(
      (range) =>
        range.day.toDateString() === day.toDateString() &&
        hour >= parseInt(range.startTime.split(":")[0] ?? "0", 10) &&
        hour < parseInt(range.endTime.split(":")[0] ?? "0", 10),
    );
  };

  /**
   * Determines if a specific day-hour cell is currently being selected.
   * @param day The day of the cell.
   * @param hour The hour of the cell.
   * @returns A boolean indicating if the cell is currently being selected.
   */
  const isCellCurrentlySelecting = (day: Date, hour: number): boolean => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    if (day.toDateString() !== dragStart.day.toDateString()) return false;

    const minHour = Math.min(dragStart.hour, dragEnd.hour);
    const maxHour = Math.max(dragStart.hour, dragEnd.hour) + 1;

    return hour >= minHour && hour < maxHour;
  };

  /**
   * Generates an array of the next 7 days starting from today.
   * @returns An array of Date objects representing the next 7 days.
   */
  const getWeekDays = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays();

  return (
    <div>
      <Label className="mb-2">Select Your Availability</Label>
      <div ref={calendarRef} className="overflow-auto">
        <div className="grid grid-cols-8 border border-gray-300">
          {/* Header Row */}
          <div className="border-b border-gray-300 p-2 font-semibold">Time</div>
          {weekDays.map((day) => (
            <div
              key={day.toDateString()}
              className="border-b border-gray-300 p-2 font-semibold"
            >
              {day.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          ))}

          {/* Time Rows */}
          {HOURS.map((hour) => (
            <Fragment key={hour}>
              {/* Time Label */}
              <div className="border-t border-gray-200 p-1">
                {formatHour(hour)}
              </div>
              {/* Time Slot Cells */}
              {weekDays.map((day) => (
                <div
                  key={`${day.toDateString()}-${hour}`}
                  className="border-t border-gray-200"
                  aria-label={`Select time from ${formatHour(hour)} to ${formatHour(hour + 1)} on ${day.toLocaleDateString()}`}
                >
                  <div
                    className={`flex h-10 cursor-pointer items-center justify-center border-t border-gray-200 ${
                      isCellSelected(day, hour) ? "bg-blue-200" : "bg-white"
                    } ${
                      isCellCurrentlySelecting(day, hour) ? "bg-blue-300" : ""
                    }`}
                    onMouseDown={() => handleMouseDown(day, hour)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                  ></div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
