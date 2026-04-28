# Data Mutations

## Helper Functions via `/data`

All database mutations must go through helper functions in the `src/data` directory.

- **Always use Drizzle ORM** — never write raw SQL.
- Each helper function is responsible for a single, well-scoped mutation (insert, update, or delete).
- Helper functions must accept the authenticated user's ID as a parameter and scope all mutations by it.

Example structure:
```
src/data
  workouts.ts    # e.g. createWorkout(userId, data), deleteWorkout(userId, workoutId)
  exercises.ts   # e.g. addExercise(userId, workoutId, data)
```

Example helper:
```ts
// src/data/workouts.ts
export async function createWorkout(userId: string, data: { name: string; date: Date }) {
  return db.insert(workouts).values({ ...data, userId }).returning();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Server Actions

All data mutations must be triggered via **Next.js Server Actions**.

- Server actions must live in colocated `actions.ts` files, next to the route or component that uses them.
- Every server action file must begin with `"use server"`.
- Server actions must call the relevant `src/data` helper — they must not contain raw Drizzle or SQL calls directly.

Example structure:
```
src/app/workouts/
  page.tsx
  actions.ts   ← server actions for this route
```

## Typed Parameters — No FormData

All server action parameters must be explicitly typed. **Do not use `FormData` as a parameter type.**

```ts
// CORRECT
export async function createWorkoutAction(data: { name: string; date: Date }) { ... }

// WRONG
export async function createWorkoutAction(formData: FormData) { ... } // ❌
```

## Zod Validation

Every server action must validate its arguments with Zod before doing anything else.

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.date(),
});

export async function createWorkoutAction(data: { name: string; date: Date }) {
  const parsed = createWorkoutSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return createWorkout(session.user.id, parsed.data);
}
```

## User Data Isolation

Server actions must obtain the authenticated user's ID from the server-side session — never from client-supplied parameters.

```ts
// CORRECT — get userId from the session
const session = await auth();
const userId = session.user.id;

// WRONG — never trust a userId from the client
export async function deleteWorkoutAction(userId: string, workoutId: string) { ... } // ❌
```

## Redirects

Do not call `redirect()` inside server actions. After a server action resolves on the client, use `router.push()` (or `router.replace()`) from `next/navigation` to navigate programmatically.

```ts
// CORRECT — redirect on the client after the action resolves
const router = useRouter();

async function onSubmit(values: FormValues) {
  await createWorkoutAction(values);
  router.push("/dashboard");
}

// WRONG — do not redirect inside the server action
export async function createWorkoutAction(data: { name: string }) {
  // ...
  redirect("/dashboard"); // ❌
}
```

## Summary

| Rule | Requirement |
|---|---|
| Where to write DB mutations | `src/data` helpers via Drizzle ORM |
| Raw SQL | Never |
| Where to call mutations from | Server actions in colocated `actions.ts` files |
| Server action parameter types | Explicit TypeScript types — no `FormData` |
| Argument validation | Zod, before any other logic |
| User ID source | Server-side session only — never client-supplied |
| Redirects after mutation | Client-side via `router.push()` — never `redirect()` in server actions |
