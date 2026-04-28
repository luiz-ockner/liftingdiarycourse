# Server Components

## Params Must Be Awaited

In this project, `params` (and `searchParams`) are **Promises** and must be awaited before accessing any properties.

```ts
// CORRECT
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// WRONG — params is a Promise, not a plain object
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params; // ❌
}
```

Always type `params` as `Promise<{ ... }>` and `await` it before use.

## Page Props Typing

Type page props using the `Promise` wrapper for both `params` and `searchParams`:

```ts
interface PageProps {
  params: Promise<{ workoutId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { workoutId } = await params;
}
```

## Summary

| Rule | Requirement |
|---|---|
| `params` type | `Promise<{ ... }>` |
| `searchParams` type | `Promise<{ ... }>` |
| Accessing params | Always `await` before reading properties |
