"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const mockWorkouts = [
  {
    id: 1,
    name: "Back Squat",
    sets: 4,
    reps: 5,
    weight: 100,
    date: new Date(2026, 3, 25),
  },
  {
    id: 2,
    name: "Bench Press",
    sets: 3,
    reps: 8,
    weight: 80,
    date: new Date(2026, 3, 25),
  },
  {
    id: 3,
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: 140,
    date: new Date(2026, 3, 25),
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workoutsForDate = mockWorkouts.filter(
    (w) =>
      w.date.getFullYear() === date.getFullYear() &&
      w.date.getMonth() === date.getMonth() &&
      w.date.getDate() === date.getDate()
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>

      <div className="mb-8">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={buttonVariants({ variant: "outline" })}
            render={<button className="w-56 justify-start gap-2" />}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {format(date, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Workouts — {format(date, "do MMM yyyy")}
        </h2>

        {workoutsForDate.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="space-y-3">
            {workoutsForDate.map((workout) => (
              <li
                key={workout.id}
                className="flex items-center justify-between rounded-lg border px-5 py-4"
              >
                <span className="font-medium">{workout.name}</span>
                <span className="text-sm text-muted-foreground">
                  {workout.sets} × {workout.reps} @ {workout.weight} kg
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
