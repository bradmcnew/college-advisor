"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Type definition for a time block.
 */
interface TimeBlock {
  day: Date;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

interface TimeBlockFormProps {
  day: Date;
  blockLength: number;
  onChange: (day: Date, blocks: TimeBlock[]) => void;
}

/**
 * Component for selecting time blocks on a specific day.
 */
export default function TimeBlockForm({
  day,
  blockLength,
  onChange,
}: TimeBlockFormProps) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);

  /**
   * Generates time slots based on the block length.
   */
  const generateTimeSlots = () => {
    const slots: TimeBlock[] = [];
    const start = new Date(day);
    start.setHours(9, 0, 0, 0); // Start at 9 AM
    const end = new Date(day);
    end.setHours(17, 0, 0, 0); // End at 5 PM

    while (start < end) {
      const endTime = new Date(start);
      endTime.setMinutes(endTime.getMinutes() + blockLength);
      if (endTime > end) break;
      slots.push({
        day,
        startTime: start.toISOString(),
        endTime: endTime.toISOString(),
      });
      start.setMinutes(start.getMinutes() + blockLength);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  /**
   * Toggles the selection of a time slot.
   * @param slot The time slot to toggle.
   */
  const handleToggle = (slot: TimeBlock) => {
    setBlocks((prev) => {
      const exists = prev.find(
        (b) => b.startTime === slot.startTime && b.endTime === slot.endTime,
      );
      if (exists) {
        return prev.filter(
          (b) => b.startTime !== slot.startTime || b.endTime !== slot.endTime,
        );
      } else {
        return [...prev, slot];
      }
    });
  };

  // Notify parent component of changes in selected blocks.
  useEffect(() => {
    onChange(day, blocks);
  }, [blocks, day, onChange]);

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xl font-semibold">
        {day.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => {
          const isSelected = blocks.some(
            (b) => b.startTime === slot.startTime && b.endTime === slot.endTime,
          );
          return (
            <Button
              key={slot.startTime}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "w-full",
                isSelected && "bg-primary text-primary-foreground",
              )}
              onClick={() => handleToggle(slot)}
            >
              {new Date(slot.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(slot.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
