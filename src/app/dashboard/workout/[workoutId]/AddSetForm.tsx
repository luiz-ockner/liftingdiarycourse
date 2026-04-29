"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addSetToExerciseAction } from "./actions";

const schema = z.object({
  reps: z.string().optional(),
  weightKg: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddSetFormProps {
  workoutExerciseId: number;
}

export function AddSetForm({ workoutExerciseId }: AddSetFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const reps = values.reps ? parseInt(values.reps, 10) : null;
    const weightKg = values.weightKg?.trim() || null;
    await addSetToExerciseAction(workoutExerciseId, { reps, weightKg });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mt-3">
      <Input
        {...register("reps")}
        placeholder="Reps"
        type="number"
        min={1}
        className="w-24 h-8 text-sm"
      />
      <Input
        {...register("weightKg")}
        placeholder="kg"
        className="w-24 h-8 text-sm"
      />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        + Add set
      </Button>
    </form>
  );
}
