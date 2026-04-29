"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeExerciseFromWorkoutAction, removeSetAction } from "./actions";
import { AddSetForm } from "./AddSetForm";

interface ExerciseCardProps {
  workoutExerciseId: number;
  exerciseName: string;
  sets: {
    id: number;
    setNumber: number;
    reps: number | null;
    weightKg: string | null;
  }[];
}

export function ExerciseCard({
  workoutExerciseId,
  exerciseName,
  sets,
}: ExerciseCardProps) {
  const [isPendingExercise, startExerciseTransition] = useTransition();

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">{exerciseName}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPendingExercise}
          onClick={() =>
            startExerciseTransition(() =>
              removeExerciseFromWorkoutAction(workoutExerciseId)
            )
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {sets.length > 0 && (
        <div className="space-y-1 mb-2">
          {sets.map((set) => (
            <SetRow key={set.id} set={set} />
          ))}
        </div>
      )}

      <AddSetForm workoutExerciseId={workoutExerciseId} />
    </div>
  );
}

function SetRow({
  set,
}: {
  set: { id: number; setNumber: number; reps: number | null; weightKg: string | null };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span className="w-12">Set {set.setNumber}</span>
      <span className="w-16">{set.reps != null ? `${set.reps} reps` : "—"}</span>
      <span className="w-20">{set.weightKg != null ? `${set.weightKg} kg` : "—"}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 ml-auto"
        disabled={isPending}
        onClick={() => startTransition(() => removeSetAction(set.id))}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
