# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do not create custom UI components.
- Do not use any other component library (e.g. MUI, Ant Design, Chakra UI).
- If a shadcn/ui component does not exist for a given need, compose the UI using existing shadcn/ui primitives only.
- All shadcn/ui components live in `src/components/ui/` and are added via the shadcn CLI:

```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

Use `date-fns` for all date formatting. Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
