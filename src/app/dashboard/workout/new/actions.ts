"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.date(),
});

export async function createWorkoutAction(data: { name: string; startedAt: Date }) {
  const parsed = createWorkoutSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await createWorkout(userId, parsed.data);
}
