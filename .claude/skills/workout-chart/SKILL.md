---
name: workout-chart
description: >
  Generates a bar chart image showing number of workouts per month for the past 12 months,
  querying the PostgreSQL database defined in the project's .env file. Use this skill whenever
  the user asks to visualize, chart, plot, or analyze workout frequency, trends, or history —
  even if they don't explicitly say "chart" or "database". Triggers on phrases like "show my
  workouts", "how many times did I work out", "plot my gym history", "workout activity chart",
  or "export workout stats as an image".
---

# Workout Chart Skill

Generate a bar chart of workouts per month for the past 12 months from the project database.

## What this skill does

1. Reads `DATABASE_URL` from the `.env` file in the project root
2. Queries the `workouts` table for all entries in the past 12 months (`started_at` field)
3. Groups results by calendar month (filling in 0 for months with no workouts)
4. Renders a bar chart with months on the x-axis and workout count on the y-axis
5. Saves the chart as a PNG image and reports the output path

## How to run it

Run the bundled script directly. The skill directory is at:
`C:\Users\ocknerlui\Documents\liftingdiarycourse\.claude\skills\workout-chart\`

```bash
python "<skill_dir>/scripts/generate_chart.py" "<path_to_.env>" "<output_path>"
```

**Arguments:**
- `<path_to_.env>` — path to the `.env` file containing `DATABASE_URL` (default: `.env` in cwd)
- `<output_path>` — where to save the PNG (default: `workout_chart.png` in cwd)

**Example** (run from the project root):
```bash
python ".claude/skills/workout-chart/scripts/generate_chart.py" ".env" "workout_chart.png"
```

## Dependencies

The script requires these Python packages. Install them if not already present:

```bash
pip install psycopg2-binary matplotlib python-dateutil
```

## What to tell the user

After running, report:
- The full output path of the saved image
- A brief summary: how many months had data, total workouts in the period
- If any packages were missing and had to be installed

## Error handling

- If `DATABASE_URL` is missing from `.env`, the script exits with a clear error message
- If the database is unreachable, psycopg2 will surface the connection error — relay it to the user
- If matplotlib or psycopg2 are not installed, install them with pip before re-running
