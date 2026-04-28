# Routing

## Route Structure

All application routes must be nested under `/dashboard`. There are no top-level feature routes.

```
/dashboard              — main dashboard
/dashboard/[feature]    — feature sub-pages
```

## Protected Routes

Every route under `/dashboard` is a protected route — only authenticated users may access it. Route protection is enforced via **Next.js Middleware** (`src/middleware.ts`), not inside individual page components.

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = /* check session/token */;

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

- Do **not** add auth guards inside `page.tsx` files — the middleware is the single enforcement point.
- The matcher must cover `/dashboard` and all sub-paths (`/dashboard/:path*`).

## Summary

| Rule | Requirement |
|---|---|
| Feature routes | Must live under `/dashboard` |
| Auth enforcement | Next.js Middleware only (`src/middleware.ts`) |
| Page-level auth guards | Not allowed |
| Unauthenticated redirect | `/login` |
