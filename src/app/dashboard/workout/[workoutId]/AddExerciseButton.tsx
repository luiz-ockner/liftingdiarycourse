"use client";

import { useState, useTransition } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { addExerciseToWorkoutAction } from "./actions";

interface AddExerciseButtonProps {
  workoutId: number;
  allExercises: { id: number; name: string }[];
  existingExerciseIds: number[];
}

export function AddExerciseButton({
  workoutId,
  allExercises,
  existingExerciseIds,
}: AddExerciseButtonProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = allExercises.filter(
    (e) =>
      !existingExerciseIds.includes(e.id) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(exerciseId: number) {
    startTransition(async () => {
      await addExerciseToWorkoutAction(workoutId, exerciseId);
      setOpen(false);
      setSearch("");
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        + Add exercise
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8 text-sm"
          autoFocus
        />
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1">No exercises found</p>
          )}
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              disabled={isPending}
              onClick={() => handleSelect(exercise.id)}
              className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent disabled:opacity-50"
            >
              {exercise.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
