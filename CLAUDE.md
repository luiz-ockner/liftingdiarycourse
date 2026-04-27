# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**Before generating any code, Claude Code MUST first consult the relevant documentation files in the `/docs` directory.** All implementation decisions, patterns, and conventions should align with what is specified there. If a relevant doc file exists for the feature or area being worked on, it takes precedence over general assumptions or defaults.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via PostCSS)
- Fonts: Geist Sans and Geist Mono via `next/font/google`

## Architecture

This is a fresh Next.js App Router project. The entry point is `src/app/page.tsx` (the `/` route). `src/app/layout.tsx` defines the root layout with global font variables and `globals.css`. There are no API routes, data fetching layers, or additional pages yet.
