# Data Fetching

## Server Components Only

**ALL data fetching must be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`/app/api/`)
- Client components (`"use client"`)
- Any other mechanism

This is non-negotiable. If a component needs data, it must be a Server Component (or delegate to one).

## Database Access via `/data` Helpers

All database queries must go through helper functions located in the `/data` directory.

- **Always use Drizzle ORM** — never write raw SQL.
- Each helper function is responsible for a specific, well-scoped query.
- Helper functions must accept the authenticated user's ID as a parameter and filter all queries by it.

Example structure:
```
/data
  workouts.ts    # e.g. getWorkoutsForUser(userId)
  exercises.ts   # e.g. getExercisesForWorkout(userId, workoutId)
```

## User Data Isolation

**A logged-in user must only ever be able to access their own data.**

Every query in every `/data` helper function must include a `WHERE userId = <authenticated user's id>` clause (expressed via Drizzle ORM). Never trust user-supplied IDs alone — always cross-reference against the authenticated session's user ID.

```ts
// CORRECT — always scope to the authenticated user
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — never fetch without a user scope
export async function getAllWorkouts() {
  return db.select().from(workouts); // ❌
}
```

The authenticated user's ID must be obtained from the server-side session (e.g. via Auth.js `auth()`) — never from query params, request bodies, or any client-supplied value.

## Summary

| Rule | Requirement |
|---|---|
| Where to fetch data | Server Components only |
| How to query the DB | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| Route handler queries | Never |
| Client component queries | Never |
| User data isolation | Every query must be scoped to the authenticated user's ID |
