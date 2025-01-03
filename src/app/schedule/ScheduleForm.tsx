"use client";

import { useState, useCallback } from "react";
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
import { submitAvailability } from "./actions";
import WeeklyCalendar from "./WeeklyCalendar";

interface TimeRange {
  day: Date;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface ScheduleFormProps {
  mentorId: string;
}

export default function ScheduleForm({ mentorId }: ScheduleFormProps) {
  const { toast } = useToast();
  const [selectedRanges, setSelectedRanges] = useState<TimeRange[]>([]);
  const [blockLength, setBlockLength] = useState<number>(15); // Default to 15 minutes

  /**
   * Handles the submission of availability.
   */
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
      setSelectedRanges([]);
    } catch (error: any) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description:
          "There was an issue updating your availability. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedRanges, mentorId, toast]);

  return (
    <div>
      <Label className="mb-2">Select Meeting Length</Label>
      <Select
        value={blockLength.toString()}
        onValueChange={(value) => setBlockLength(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Meeting Length" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15">15 Minutes</SelectItem>
          <SelectItem value="30">30 Minutes</SelectItem>
          <SelectItem value="45">45 Minutes</SelectItem>
          <SelectItem value="60">1 Hour</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <WeeklyCalendar
          selectedRanges={selectedRanges}
          onChange={setSelectedRanges}
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
