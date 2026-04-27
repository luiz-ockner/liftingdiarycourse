import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end)
      )
    );

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string;
      startedAt: Date;
      exercises: Map<
        number,
        {
          id: number;
          name: string;
          order: number;
          sets: { id: number; setNumber: number; reps: number | null; weightKg: string | null }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId == null || row.exerciseName == null) continue;

    if (!workout.exercises.has(row.workoutExerciseId)) {
      workout.exercises.set(row.workoutExerciseId, {
        id: row.workoutExerciseId,
        name: row.exerciseName,
        order: row.exerciseOrder!,
        sets: [],
      });
    }
    const exercise = workout.exercises.get(row.workoutExerciseId)!;

    if (row.setId != null) {
      exercise.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weightKg: row.weightKg,
      });
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()).sort((a, b) => a.order - b.order),
  }));
}

export async function createWorkout(userId: string, data: { name: string; startedAt: Date }) {
  return db.insert(workouts).values({ ...data, userId }).returning();
}
