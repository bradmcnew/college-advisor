"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { CalendarIcon, Clock, CalendarX2 } from "lucide-react";

// Types for Calendly availability data
interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

interface CalendlyWidgetProps {
  userId: string;
  hasCalendlyAccess: boolean;
}

export default function CalendlyWidget({ userId, hasCalendlyAccess }: CalendlyWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availabilityData, setAvailabilityData] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch availability from Calendly API
  const fetchAvailability = useCallback(async () => {
    if (!hasCalendlyAccess) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/calendly/availability?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const rawData = await response.json();

      // Transform the Calendly API response to the expected format
      const transformedData: DayAvailability[] = [];

      // Check if we have the expected data structure
      if (rawData?.collection?.[0]?.rules) {
        const rules = rawData.collection[0].rules;

        // Get the next 14 days
        const startDate = new Date();

        for (let i = 0; i < 14; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);

          // Get day of week
          const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

          // Find rule for this weekday
          const rule = rules.find((r: any) => r.wday === weekday);

          if (rule?.intervals?.length) {
            // This day has availability slots
            const dateString = currentDate.toISOString().split('T')[0];
            const slots: TimeSlot[] = rule.intervals.map((interval: any) => {
              // Convert from HH:MM to full ISO dates
              const [startHour, startMinute] = interval.from.split(':').map(Number);
              const [endHour, endMinute] = interval.to.split(':').map(Number);

              const startTime = new Date(currentDate);
              startTime.setHours(startHour, startMinute, 0, 0);

              const endTime = new Date(currentDate);
              endTime.setHours(endHour, endMinute, 0, 0);

              return {
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString()
              };
            });

            transformedData.push({
              date: dateString,
              slots: slots
            });
          }
        }
      }

      setAvailabilityData(transformedData);
    } catch (err) {
      setError("Error fetching availability data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, hasCalendlyAccess]);

  // Fetch availability data when component mounts
  useEffect(() => {
    if (hasCalendlyAccess) {
      fetchAvailability();
    }
  }, [fetchAvailability, hasCalendlyAccess]);

  // Check if a date has available slots
  const hasAvailability = (day: Date | undefined) => {
    if (!day || !Array.isArray(availabilityData)) return false;

    const dateString = day.toISOString().split("T")[0];
    return availabilityData.some((item) => item.date === dateString && item.slots.length > 0);
  };

  // Get available slots for a specific date
  const getAvailableSlots = (day: Date | undefined) => {
    if (!day || !Array.isArray(availabilityData)) return [];

    const dateString = day.toISOString().split("T")[0];
    const dayData = availabilityData.find((item) => item.date === dateString);
    return dayData?.slots || [];
  };

  // Display time slots for the selected date
  const AvailableTimeSlots = () => {
    if (!date) return null;

    const slots = getAvailableSlots(date);

    if (slots.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No available slots for this date
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {slots.map((slot, index) => {
          const startTime = new Date(slot.start_time);
          const endTime = new Date(slot.end_time);

          return (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100">
              <Clock className="h-4 w-4" />
              <span>
                {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!hasCalendlyAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect to Calendly</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Connect your Calendly account to view and manage your availability
          </p>
          <Button asChild>
            <a href="/auth/calendly/authorize">Connect Calendly Account</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Availability Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto mb-6 gap-2">
              <CalendarIcon className="h-4 w-4" />
              View My Availability
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>My Availability Calendar</DialogTitle>
            </DialogHeader>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">{error}</div>
            ) : (
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow mx-auto"
                  disabled={{ before: new Date() }}
                  modifiers={{
                    available: (date) => hasAvailability(date),
                  }}
                  modifiersClassNames={{
                    available: "bg-green-50 text-green-900 font-medium hover:bg-green-100 dark:bg-green-900/20 dark:text-green-100",
                  }}
                />

                {date && <AvailableTimeSlots />}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <Skeleton className="h-[350px] w-full rounded-md" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <CalendarX2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Select a Date</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
                disabled={{ before: new Date() }}
                modifiers={{
                  available: (date) => hasAvailability(date),
                }}
                modifiersClassNames={{
                  available: "bg-green-50 text-green-900 font-medium hover:bg-green-100 dark:bg-green-900/20 dark:text-green-100",
                }}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">
                {date
                  ? date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Available Times"}
              </h3>
              <AvailableTimeSlots />
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <a
              href="https://calendly.com/app/availability"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Edit in Calendly
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
