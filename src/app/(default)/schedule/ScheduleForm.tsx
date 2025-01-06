"use client";
import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { submitAvailability } from "~/app/(default)/schedule/actions";
import WeeklyCalendar from "~/app/(default)/schedule/WeeklyCalendar";

interface TimeRange {
  day: Date;
  startTime: string; // iso string
  endTime: string; // iso string
}

interface ScheduleFormProps {
  initialAvailabilities: {
    startTime: string;
    endTime: string;
  }[];
}

export default function ScheduleForm({
  initialAvailabilities,
}: ScheduleFormProps) {
  const { toast } = useToast();

  // Helper function to convert UTC date to local date while preserving the date
  const utcToLocalDate = (utcDate: string): Date => {
    const date = new Date(utcDate);
    console.log("utcDate", date.toISOString());
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(), // Midnight local time
      0,
      0,
      0,
    );
    console.log("localDate", localDate);
    return localDate;
  };

  // Helper function to convert UTC time string to "HH:MM"
  const utcToLocalTime = (utcTime: string): string => {
    console.log("utcTime", utcTime);
    const date = new Date(utcTime);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    console.log(`localTime: ${hours}:${minutes}`);
    return `${hours}:${minutes}`;
  };

  const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>(() => {
    return initialAvailabilities.map((avail) => ({
      day: utcToLocalDate(avail.startTime),
      startTime: utcToLocalTime(avail.startTime),
      endTime: utcToLocalTime(avail.endTime),
    }));
  });

  // Helper function to convert local date to UTC ISO string
  const localToUTCDateTime = (localDate: Date, localTime: string): string => {
    const [hours, minutes] = localTime.split(":").map(Number);
    const date = new Date(localDate);
    date.setHours(hours ?? 0, minutes, 0, 0);
    console.log(
      "local to utc datetime:\n",
      "localDate",
      localDate,
      "\n",
      "utcDate",
      date,
    );
    return date.toISOString();
  };

  const getUTCDate = (utcDate: string): string => {
    return utcDate.substring(0, 10);
  };

  const handleSubmit = useCallback(async () => {
    if (selectedRanges.length === 0) {
      toast({
        title: "Error",
        description: "Please set valid time ranges for at least one day.",
        variant: "destructive",
      });
      return;
    }

    const payload = selectedRanges.map((range) => {
      const localStart = localToUTCDateTime(range.day, range.startTime);
      const localEnd = localToUTCDateTime(range.day, range.endTime);
      return {
        day: getUTCDate(localStart), // "YYYY-MM-DD"
        startTime: localStart, // Full UTC ISO string
        endTime: localEnd, // Full UTC ISO string
      };
    });
    console.log("payload", payload);

    try {
      await submitAvailability(payload);
      toast({
        title: "Success",
        description: "Your availability has been updated.",
      });
    } catch (error: any) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description:
          "There was an issue updating your availability. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedRanges, toast]);

  return (
    <div>
      <div className="mt-4">
        <WeeklyCalendar
          selectedRanges={selectedRanges}
          onValueChange={setSelectedRanges}
        />
      </div>
      {selectedRanges.length > 0 && (
        <Button
          onClick={handleSubmit}
          className="mt-6"
          disabled={selectedRanges.length === 0}
        >
          Submit Availability
        </Button>
      )}
    </div>
  );
}
