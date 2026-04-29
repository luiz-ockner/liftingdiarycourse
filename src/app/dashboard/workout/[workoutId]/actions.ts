"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and, max } from "drizzle-orm";
import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { updateWorkout, getWorkoutById } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.date(),
});

export async function updateWorkoutAction(
  workoutId: number,
  data: { name: string; startedAt: Date }
) {
  const parsed = updateWorkoutSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await updateWorkout(userId, workoutId, parsed.data);
}

async function assertWorkoutExerciseOwnership(
  workoutExerciseId: number,
  userId: string
): Promise<void> {
  const rows = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .limit(1);

  if (rows.length === 0) throw new Error("Unauthorized");
}

async function assertSetOwnership(setId: number, userId: string): Promise<void> {
  const rows = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);

  if (rows.length === 0) throw new Error("Unauthorized");
}

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(workoutId: number, exerciseId: number) {
  const parsed = addExerciseSchema.safeParse({ workoutId, exerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) throw new Error("Unauthorized");

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const order = (maxOrder ?? 0) + 1;

  await db.insert(workoutExercises).values({ workoutId, exerciseId, order });

  revalidatePath(`/dashboard/workout/${workoutId}`);
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable(),
});

export async function addSetToExerciseAction(
  workoutExerciseId: number,
  data: { reps: number | null; weightKg: string | null }
) {
  const parsed = addSetSchema.safeParse({ workoutExerciseId, ...data });
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await assertWorkoutExerciseOwnership(workoutExerciseId, userId);

  const [{ maxSetNumber }] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const setNumber = (maxSetNumber ?? 0) + 1;

  await db.insert(sets).values({
    workoutExerciseId,
    setNumber,
    reps: parsed.data.reps,
    weightKg: parsed.data.weightKg,
  });

  const weRow = await db
    .select({ workoutId: workoutExercises.workoutId })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1);

  revalidatePath(`/dashboard/workout/${weRow[0].workoutId}`);
}

export async function removeExerciseFromWorkoutAction(workoutExerciseId: number) {
  const parsed = z.number().int().positive().safeParse(workoutExerciseId);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await assertWorkoutExerciseOwnership(workoutExerciseId, userId);

  const weRow = await db
    .select({ workoutId: workoutExercises.workoutId })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1);

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));

  revalidatePath(`/dashboard/workout/${weRow[0].workoutId}`);
}

export async function removeSetAction(setId: number) {
  const parsed = z.number().int().positive().safeParse(setId);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await assertSetOwnership(setId, userId);

  const setRow = await db
    .select({ workoutExerciseId: sets.workoutExerciseId })
    .from(sets)
    .where(eq(sets.id, setId))
    .limit(1);

  const weRow = await db
    .select({ workoutId: workoutExercises.workoutId })
    .from(workoutExercises)
    .where(eq(workoutExercises.id, setRow[0].workoutExerciseId))
    .limit(1);

  await db.delete(sets).where(eq(sets.id, setId));

  revalidatePath(`/dashboard/workout/${weRow[0].workoutId}`);
}
