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
import TimeBlockForm from "./TimeBlockForm";
import { useToast } from "~/hooks/use-toast";
import { submitSchedule } from "./actions";

/**
 * Type definition for a time block.
 */
interface TimeBlock {
  day: Date;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export default function ScheduleForm() {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [blockLength, setBlockLength] = useState<number>(60); // Default to 60 minutes

  /**
   * Handles the selection and deselection of days.
   */
  const handleDaySelect = useCallback((days: Date[] | undefined) => {
    setSelectedDays(days || []);
  }, []);

  /**
   * Handles changes in time blocks for a specific day.
   */
  const handleTimeBlockChange = useCallback(
    (day: Date, newBlocks: TimeBlock[]) => {
      setTimeBlocks((prev) => {
        const otherTimeBlocks = prev.filter(
          (block) => block.day.toDateString() !== day.toDateString(),
        );
        return [...otherTimeBlocks, ...newBlocks];
      });
    },
    [],
  );

  /**
   * Handles the form submission by invoking the server action.
   */
  const handleSubmit = async () => {
    try {
      // Replace with actual mentor ID from session
      const mentorId = "4be2f56c-f9e2-44ce-aa31-2a050adfed08";

      // Prepare data for submission
      const payload = timeBlocks.map((block) => ({
        mentor_id: mentorId,
        mentee_id: null,
        scheduled_time: block.startTime,
        meeting_url: "", // Initialize as empty or generate as needed
        status: "scheduled",
      }));

      // Call the server action
      await submitSchedule(payload);

      toast({
        title: "Success",
        description: "Your schedule has been updated successfully.",
      });

      // Reset selections
      setSelectedDays([]);
      setTimeBlocks([]);
    } catch (error: any) {
      console.error("Error submitting schedule:", error);
      toast({
        title: "Error",
        description:
          "There was an issue updating your schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <SelectItem value="30">30 Minutes</SelectItem>
          <SelectItem value="60">1 Hour</SelectItem>
          <SelectItem value="90">1.5 Hours</SelectItem>
          <SelectItem value="120">2 Hours</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <Calendar
          mode="multiple" // Ensure mode is set to "multiple"
          selected={selectedDays}
          onSelect={handleDaySelect}
          className="rounded-md border p-2"
        />
      </div>

      {selectedDays.length > 0 && (
        <div className="mt-6">
          {selectedDays.map((day) => (
            <TimeBlockForm
              key={day.toDateString()}
              day={day}
              blockLength={blockLength}
              onChange={handleTimeBlockChange}
            />
          ))}
        </div>
      )}

      {timeBlocks.length > 0 && (
        <div className="mt-6">
          <Button onClick={handleSubmit}>Submit Schedule</Button>
        </div>
      )}
    </div>
  );
}
