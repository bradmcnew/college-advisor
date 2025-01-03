"use client";

import { useState, useCallback } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import TimeRangeForm from "./TimeRangeForm";
import { useToast } from "~/hooks/use-toast";
import { submitAvailability } from "./actions";

/**
 * Type definition for a time range.
 */
interface TimeRange {
  day: Date;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

interface ScheduleFormProps {
  mentorId: string;
}

export default function ScheduleForm({ mentorId }: ScheduleFormProps) {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  const [blockLength, setBlockLength] = useState<number>(15); // Default to 15 minutes

  /**
   * Handles the selection and deselection of days.
   */
  const handleDaySelect = useCallback((days: Date[] | undefined) => {
    setSelectedDays(days || []);
    // Remove time ranges for unselected days
    setTimeRanges(
      (prev) =>
        prev.filter((range) =>
          days?.some(
            (selectedDay) =>
              selectedDay.toDateString() === range.day.toDateString(),
          ),
        ) || [],
    );
  }, []);

  /**
   * Handles changes in time ranges for a specific day.
   */
  const handleTimeRangeChange = useCallback(
    (day: Date, range: TimeRange | null) => {
      setTimeRanges((prev) => {
        const otherTimeRanges = prev.filter(
          (r) => r.day.toDateString() !== day.toDateString(),
        );
        if (range) {
          return [...otherTimeRanges, range];
        }
        return otherTimeRanges;
      });
    },
    [],
  );

  /**
   * Handles the submission of availability.
   */
  const handleSubmit = useCallback(async () => {
    const payload = timeRanges.map((range) => ({
      mentor_id: mentorId,
      day: range.day?.toISOString().split("T")[0] ?? "",
      start_time: `${range.day?.toISOString().split("T")[0]}T${range.startTime}:00.000Z`,
      end_time: `${range.day?.toISOString().split("T")[0]}T${range.endTime}:00.000Z`,
    }));

    try {
      await submitAvailability(payload);
      toast({
        title: "Success",
        description: "Your availability has been updated.",
      });
      setSelectedDays([]);
      setTimeRanges([]);
    } catch (error: any) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description:
          "There was an issue updating your availability. Please try again.",
        variant: "destructive",
      });
    }
  }, [timeRanges, mentorId, toast]);

  return (
    <div>
      <Label className="mb-2">Select Block Length</Label>
      <Select
        value={blockLength.toString()}
        onValueChange={(value) => setBlockLength(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select block length" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15">15 Minutes</SelectItem>
          <SelectItem value="30">30 Minutes</SelectItem>
          <SelectItem value="45">45 Minutes</SelectItem>
          <SelectItem value="60">1 Hour</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <Calendar
          mode="multiple" // Allows multiple day selection
          selected={selectedDays}
          onSelect={handleDaySelect}
          className="rounded-md border p-2"
        />
      </div>

      {selectedDays.length > 0 && (
        <div className="mt-6">
          {selectedDays.map((day) => (
            <TimeRangeForm
              key={day.toDateString()}
              day={day}
              onChange={handleTimeRangeChange}
            />
          ))}
        </div>
      )}

      {timeRanges.length > 0 && (
        <div className="mt-6">
          <Button onClick={handleSubmit}>Submit Availability</Button>
        </div>
      )}
    </div>
  );
}
