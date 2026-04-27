"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Set = {
  id: number;
  setNumber: number;
  reps: number | null;
  weightKg: string | null;
};

type Exercise = {
  id: number;
  name: string;
  order: number;
  sets: Set[];
};

type Workout = {
  id: number;
  name: string;
  exercises: Exercise[];
};

type Props = {
  isoDate: string;
  workouts: Workout[];
};

export function WorkoutList({ isoDate, workouts }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Parse without timezone shift
  const date = new Date(isoDate + "T12:00:00");

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    setOpen(false);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    startTransition(() => {
      router.push(`?date=${iso}`);
      router.refresh();
    });
  }

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
              onSelect={handleSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Workouts — {format(date, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="space-y-6">
            {workouts.map((workout) => (
              <li key={workout.id} className="rounded-lg border px-5 py-4 space-y-3">
                <p className="font-medium text-base">{workout.name}</p>
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id}>
                    <p className="text-sm font-medium mb-1">{exercise.name}</p>
                    <ul className="space-y-1">
                      {exercise.sets.map((set) => (
                        <li key={set.id} className="text-sm text-muted-foreground flex gap-4">
                          <span>Set {set.setNumber}</span>
                          {set.reps != null && <span>{set.reps} reps</span>}
                          {set.weightKg != null && <span>{set.weightKg} kg</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
