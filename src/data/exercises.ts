import { db } from "@/db";
import { exercises, workoutExercises, sets } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export type WorkoutExerciseWithSets = {
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: {
    id: number;
    setNumber: number;
    reps: number | null;
    weightKg: string | null;
  }[];
};

export async function getAllExercises(): Promise<{ id: number; name: string }[]> {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function getWorkoutExercisesWithSets(
  workoutId: number
): Promise<WorkoutExerciseWithSets[]> {
  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      order: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workoutExercises)
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId));

  const exerciseMap = new Map<number, WorkoutExerciseWithSets>();

  for (const row of rows) {
    if (row.exerciseName == null) continue;

    if (!exerciseMap.has(row.workoutExerciseId)) {
      exerciseMap.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId!,
        exerciseName: row.exerciseName,
        order: row.order,
        sets: [],
      });
    }

    if (row.setId != null) {
      exerciseMap.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weightKg: row.weightKg,
      });
    }
  }

  return Array.from(exerciseMap.values())
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      ...e,
      sets: e.sets.sort((a, b) => a.setNumber - b.setNumber),
    }));
}
