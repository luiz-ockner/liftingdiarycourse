# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
