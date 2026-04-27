# Authentication

## Clerk is the Only Auth Provider

**This app uses Clerk exclusively for authentication.**

- Do not use Auth.js, NextAuth, or any other authentication library.
- Do not implement custom authentication logic.
- All session management, user identity, and auth state must come from Clerk.

## Getting the Authenticated User

Always retrieve the authenticated user's ID server-side using Clerk's `auth()` helper. Never trust client-supplied user IDs.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

if (!userId) {
  // handle unauthenticated state
}
```

This must be used in Server Components and server-side code only. See `data-fetching.md` for how to pass `userId` into `/data` helper functions.

## Protecting Routes

Use Clerk middleware to protect routes. The middleware config lives in `middleware.ts` at the project root.

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|txt|xml|map|ico|png|svg|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)).*)"],
};
```

## Sign In / Sign Up Pages

Use Clerk's hosted components. Add the following routes:

- `src/app/sign-in/[[...sign-in]]/page.tsx` — renders `<SignIn />`
- `src/app/sign-up/[[...sign-up]]/page.tsx` — renders `<SignUp />`

```ts
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

## Clerk Provider

`<ClerkProvider>` must wrap the entire app in `src/app/layout.tsx`.

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Summary

| Rule | Requirement |
|---|---|
| Auth provider | Clerk only |
| Get user ID (server) | `auth()` from `@clerk/nextjs/server` |
| Route protection | Clerk middleware (`middleware.ts`) |
| Custom auth logic | Never |
| Client-supplied user IDs | Never trust — always use server-side session |
