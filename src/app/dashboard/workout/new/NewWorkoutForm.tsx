"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

export function NewWorkoutForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startedAt: new Date().toISOString().slice(0, 16),
    },
  });

  async function onSubmit(values: FormValues) {
    await createWorkoutAction({
      name: values.name,
      startedAt: new Date(values.startedAt),
    });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input id="name" placeholder="e.g. Push day" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Date &amp; time</Label>
        <Input id="startedAt" type="datetime-local" {...register("startedAt")} />
        {errors.startedAt && (
          <p className="text-sm text-red-500">{errors.startedAt.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create workout"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
