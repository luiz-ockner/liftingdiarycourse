#!/usr/bin/env python3
"""Generate a bar chart of workouts per month for the past 12 months."""

import os
import sys
import re
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import psycopg2
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker


def load_database_url(env_path=".env"):
    """Parse DATABASE_URL from a .env file."""
    if "DATABASE_URL" in os.environ:
        return os.environ["DATABASE_URL"]
    try:
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                m = re.match(r'^DATABASE_URL\s*=\s*(.+)$', line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return None


def main():
    env_path = sys.argv[1] if len(sys.argv) > 1 else ".env"
    output_path = sys.argv[2] if len(sys.argv) > 2 else "workout_chart.png"

    db_url = load_database_url(env_path)
    if not db_url:
        print("ERROR: DATABASE_URL not found in environment or .env file.", file=sys.stderr)
        sys.exit(1)

    now = datetime.now(timezone.utc)
    one_year_ago = now - relativedelta(months=12)

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    DATE_TRUNC('month', started_at) AS month,
                    COUNT(*) AS count
                FROM workouts
                WHERE started_at >= %s
                GROUP BY month
                ORDER BY month
            """, (one_year_ago,))
            rows = cur.fetchall()
    finally:
        conn.close()

    # Build full 12-month range so months with 0 workouts still appear
    months = []
    counts = []
    for i in range(12):
        month_dt = (one_year_ago + relativedelta(months=i+1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        label = month_dt.strftime("%b %Y")
        months.append(label)
        counts.append(0)

    row_map = {r[0].strftime("%b %Y"): r[1] for r in rows}
    counts = [row_map.get(m, 0) for m in months]

    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(months, counts, color="#4F81BD", edgecolor="white", linewidth=0.8)

    ax.set_xlabel("Month", fontsize=12, labelpad=8)
    ax.set_ylabel("Number of Workouts", fontsize=12, labelpad=8)
    ax.set_title("Workouts per Month (Past 12 Months)", fontsize=14, fontweight="bold", pad=12)
    ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
    ax.set_ylim(0, max(counts) + 2 if counts else 5)

    for bar, count in zip(bars, counts):
        if count > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.1,
                    str(count), ha='center', va='bottom', fontsize=9)

    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()

    print(f"Chart saved to: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    main()
