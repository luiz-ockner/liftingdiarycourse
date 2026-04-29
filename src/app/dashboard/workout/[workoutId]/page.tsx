import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getWorkoutExercisesWithSets, getAllExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./EditWorkoutForm";
import { WorkoutExerciseLog } from "./WorkoutExerciseLog";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const id = Number(workoutId);
  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(userId, id);
  if (!workout) notFound();

  const [workoutExercises, allExercises] = await Promise.all([
    getWorkoutExercisesWithSets(id),
    getAllExercises(),
  ]);

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit workout</h1>
        <EditWorkoutForm
          workoutId={workout.id}
          defaultValues={{ name: workout.name, startedAt: workout.startedAt }}
        />
      </div>
      <WorkoutExerciseLog
        workoutId={workout.id}
        workoutExercises={workoutExercises}
        allExercises={allExercises}
      />
    </div>
  );
}
