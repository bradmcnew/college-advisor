"use client";

import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface TimeRange {
  day: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

interface TimeRangeFormProps {
  day: Date;
  onChange: (day: Date, range: TimeRange | null) => void;
}

/**
 * Component for selecting a time range on a specific day.
 */
export default function TimeRangeForm({ day, onChange }: TimeRangeFormProps) {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [error, setError] = useState<string>("");

  /**
   * Validates and updates the time range.
   */
  const handleSave = useCallback(() => {
    setError("");

    if (!startTime || !endTime) {
      setError("Both start and end times are required.");
      return;
    }

    const start = new Date(`${day.toISOString().split("T")[0]}T${startTime}`);
    const end = new Date(`${day.toISOString().split("T")[0]}T${endTime}`);

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    // Define allowed time range: 7:00 AM to 11:30 PM
    const earliest = new Date(day);
    earliest.setHours(7, 0, 0, 0);
    const latest = new Date(day);
    latest.setHours(23, 30, 0, 0);

    if (start < earliest || end > latest) {
      setError("Time range must be between 7:00 AM and 11:30 PM.");
      return;
    }

    onChange(day, { day, startTime, endTime });
  }, [day, startTime, endTime, onChange]);

  const handleReset = useCallback(() => {
    setStartTime("");
    setEndTime("");
    setError("");
    onChange(day, null);
  }, [day, onChange]);

  return (
    <div className="mb-6 rounded-md border p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        {day.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h2>

      <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="flex flex-col">
          <Label htmlFor={`start-time-${day.toDateString()}`}>Start Time</Label>
          <input
            id={`start-time-${day.toDateString()}`}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            min="07:00"
            max="23:30"
          />
        </div>

        <div className="flex flex-col">
          <Label htmlFor={`end-time-${day.toDateString()}`}>End Time</Label>
          <input
            id={`end-time-${day.toDateString()}`}
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            min="07:15"
            max="23:45"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-red-500">{error}</p>}

      <div className="mt-4 flex space-x-2">
        <Button onClick={handleSave} variant="default">
          Save
        </Button>
        <Button onClick={handleReset} variant="outline" color="destructive">
          Reset
        </Button>
      </div>
    </div>
  );
}
