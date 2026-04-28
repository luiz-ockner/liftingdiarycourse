"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

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
