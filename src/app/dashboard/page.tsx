import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { WorkoutList } from "./WorkoutList";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const today = new Date();
  const isoDate =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const date = new Date(isoDate + "T12:00:00");
  const workouts = await getWorkoutsForUserOnDate(userId, date);

  return <WorkoutList isoDate={isoDate} workouts={workouts} />;
}
