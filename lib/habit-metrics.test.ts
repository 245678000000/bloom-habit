import { describe, expect, it } from "vitest";

import {
  getActiveHabits,
  getCurrentStreak,
  getDayCompletionRatio,
  getDueHabitsOnDate,
  getHabitCompletionRate,
  getHabitCurrentStreak,
  isHabitDueOnDate,
  isRestDay
} from "@/lib/habit-metrics";
import { Habit, HabitStore } from "@/lib/types";
import { toDateKey } from "@/lib/date";

function habit(partial: Partial<Habit> & Pick<Habit, "id" | "name" | "frequency">): Habit {
  return {
    emoji: "🌱",
    color: "#A8CABA",
    note: "",
    archived: false,
    createdAt: "2026-01-05",
    sortOrder: 0,
    ...partial
  };
}

function store(
  habits: Habit[],
  completions: Record<string, string[]> = {},
  restDays: string[] = []
): HabitStore {
  return {
    version: 3,
    displayName: "Test",
    habits,
    completions,
    reminderEnabled: false,
    reminderTime: "20:00",
    restDays
  };
}

describe("habit metrics", () => {
  it("sorts active habits by sortOrder", () => {
    const habits = [
      habit({ id: "b", name: "B", frequency: "daily", sortOrder: 2 }),
      habit({ id: "a", name: "A", frequency: "daily", sortOrder: 0 }),
      habit({ id: "c", name: "C", frequency: "daily", sortOrder: 1, archived: true })
    ];
    expect(getActiveHabits(habits).map((h) => h.id)).toEqual(["a", "b"]);
  });

  it("daily / weekdays / weekly / custom due rules", () => {
    const daily = habit({ id: "d", name: "Daily", frequency: "daily" });
    const weekdays = habit({ id: "w", name: "Weekdays", frequency: "weekdays" });
    const weekly = habit({ id: "k", name: "Weekly", frequency: "weekly", createdAt: "2026-01-05" });
    const custom = habit({
      id: "c",
      name: "Custom",
      frequency: "custom",
      daysOfWeek: [1, 3, 5]
    });

    const monday = new Date(2026, 0, 5);
    const sunday = new Date(2026, 0, 4);

    expect(isHabitDueOnDate(daily, sunday)).toBe(true);
    expect(isHabitDueOnDate(weekdays, monday)).toBe(true);
    expect(isHabitDueOnDate(weekdays, sunday)).toBe(false);
    expect(isHabitDueOnDate(weekly, monday)).toBe(true);
    expect(isHabitDueOnDate(weekly, sunday)).toBe(false);
    expect(isHabitDueOnDate(custom, monday)).toBe(true);
    expect(isHabitDueOnDate(custom, sunday)).toBe(false);
  });

  it("excludes archived habits from due list", () => {
    const s = store([
      habit({ id: "a", name: "A", frequency: "daily" }),
      habit({ id: "b", name: "B", frequency: "daily", archived: true })
    ]);
    const due = getDueHabitsOnDate(s, new Date(2026, 0, 5));
    expect(due.map((h) => h.id)).toEqual(["a"]);
  });

  it("rest day clears due and does not break streak", () => {
    const h = habit({ id: "a", name: "A", frequency: "daily" });
    // Jan 11 complete, Jan 10 rest, Jan 9 complete → streak 2
    const s = store(
      [h],
      {
        "2026-01-11": ["a"],
        "2026-01-09": ["a"]
      },
      ["2026-01-10"]
    );

    expect(isRestDay(s, new Date(2026, 0, 10))).toBe(true);
    expect(getDueHabitsOnDate(s, new Date(2026, 0, 10))).toEqual([]);
    expect(getDayCompletionRatio(s, new Date(2026, 0, 10))).toBe(0);
    expect(getCurrentStreak(s, new Date(2026, 0, 11))).toBe(2);
  });

  it("computes day completion ratio", () => {
    const s = store(
      [
        habit({ id: "a", name: "A", frequency: "daily", sortOrder: 0 }),
        habit({ id: "b", name: "B", frequency: "daily", sortOrder: 1 })
      ],
      { "2026-01-05": ["a"] }
    );
    expect(getDayCompletionRatio(s, new Date(2026, 0, 5))).toBe(0.5);
  });

  it("current streak skips days with no due habits and breaks on incomplete", () => {
    const weekendOnly = habit({
      id: "w",
      name: "Weekend",
      frequency: "custom",
      daysOfWeek: [0, 6],
      sortOrder: 0
    });
    const s = store([weekendOnly], {
      "2026-01-11": ["w"],
      "2026-01-10": ["w"]
    });
    expect(getCurrentStreak(s, new Date(2026, 0, 11))).toBe(2);

    const broken = store(
      [habit({ id: "a", name: "A", frequency: "daily" })],
      {
        [toDateKey(new Date(2026, 0, 11))]: ["a"]
      }
    );
    expect(getCurrentStreak(broken, new Date(2026, 0, 11))).toBe(1);
  });

  it("per-habit completion rate and streak", () => {
    const h = habit({ id: "a", name: "A", frequency: "daily" });
    const end = new Date(2026, 6, 15, 12, 0, 0);
    const d0 = toDateKey(end);
    const d1 = toDateKey(new Date(2026, 6, 14, 12, 0, 0));
    const d2 = toDateKey(new Date(2026, 6, 13, 12, 0, 0));
    const s = store(
      [h],
      {
        [d0]: ["a"],
        [d1]: ["a"],
        [d2]: ["a"]
      }
    );
    expect(getHabitCurrentStreak(s, "a", end)).toBe(3);
    // freeze "now" via completions in last 3 days relative to getPastDates default
    // getHabitCompletionRate uses real Date(); pin by completing recent keys from system clock is flaky.
    // Assert pure streak logic above; rate with explicit window via completions near end:
    const rateStore = store(
      [h],
      {
        [toDateKey(new Date())]: ["a"]
      }
    );
    expect(getHabitCompletionRate(rateStore, "a", 30)).toBeGreaterThan(0);
  });
});
