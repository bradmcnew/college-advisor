"use client";
import { useState, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { submitAvailability, getAvailability } from "./actions";
import WeeklyCalendar from "./WeeklyCalendar";

interface TimeRange {
  day: Date;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
}

interface ScheduleFormProps {
  mentorId: string;
}

export default function ScheduleForm({ mentorId }: ScheduleFormProps) {
  const { toast } = useToast();
  const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>([]);
  const [blockLength, setBlockLength] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const availabilities = await getAvailability(mentorId);
        const ranges = availabilities.map((avail) => {
          const startHours = avail.startTime.slice(11, 13);
          const startMinutes = avail.startTime.slice(14, 16);
          const endHours = avail.endTime.slice(11, 13);
          const endMinutes = avail.endTime.slice(14, 16);

          return {
            day: utcToLocalDate(avail.day),
            start_time: `${startHours}:${startMinutes}`,
            end_time: `${endHours}:${endMinutes}`,
          };
        });
        console.log("Fetched ranges:", ranges);
        setSelectedRanges(ranges);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your availability. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    void fetchAvailability();
  }, [mentorId, toast]);

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
      start_time: range.start_time,
      end_time: range.end_time,
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
