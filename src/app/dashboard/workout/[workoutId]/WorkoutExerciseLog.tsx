"use client";

import { WorkoutExerciseWithSets } from "@/data/exercises";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseButton } from "./AddExerciseButton";

interface WorkoutExerciseLogProps {
  workoutId: number;
  workoutExercises: WorkoutExerciseWithSets[];
  allExercises: { id: number; name: string }[];
}

export function WorkoutExerciseLog({
  workoutId,
  workoutExercises,
  allExercises,
}: WorkoutExerciseLogProps) {
  const existingExerciseIds = workoutExercises.map((we) => we.exerciseId);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Exercises</h2>
      <div className="space-y-4">
        {workoutExercises.map((we) => (
          <ExerciseCard
            key={we.workoutExerciseId}
            workoutExerciseId={we.workoutExerciseId}
            exerciseName={we.exerciseName}
            sets={we.sets}
          />
        ))}
      </div>
      <div className="mt-4">
        <AddExerciseButton
          workoutId={workoutId}
          allExercises={allExercises}
          existingExerciseIds={existingExerciseIds}
        />
      </div>
    </div>
  );
}
