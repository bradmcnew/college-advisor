"use client";
import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { submitAvailability } from "~/app/(default)/schedule/actions";
import WeeklyCalendar from "~/app/(default)/schedule/WeeklyCalendar";

interface TimeRange {
  day: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface ScheduleFormProps {
  mentorId: string;
  initialAvailabilities: {
    day: string;
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
    const localDate = new Date();
    localDate.setFullYear(date.getUTCFullYear());
    localDate.setMonth(date.getUTCMonth());
    localDate.setDate(date.getUTCDate());
    localDate.setHours(0, 0, 0, 0);
    return localDate;
  };

  const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>(() => {
    return initialAvailabilities.map((avail) => ({
      day: utcToLocalDate(avail.day),
      startTime: `${avail.startTime.slice(11, 13)}:${avail.startTime.slice(14, 16)}`,
      endTime: `${avail.endTime.slice(11, 13)}:${avail.endTime.slice(14, 16)}`,
    }));
  });
  // Helper function to convert local date to UTC for API submission
  const localToUTCDate = (localDate: Date): string => {
    const utcDate = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
      ),
    );
    return utcDate.toISOString().split("T")[0] ?? "";
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

    const payload = selectedRanges.map((range) => ({
      day: localToUTCDate(range.day),
      startTime: range.startTime,
      endTime: range.endTime,
    }));

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
  }, [selectedRanges, localToUTCDate, toast]);

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
