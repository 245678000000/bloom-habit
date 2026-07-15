import { describe, expect, it } from "vitest";

import {
  addDays,
  fromDateKey,
  isFutureDay,
  isSameDay,
  isWeekday,
  toDateKey
} from "@/lib/date";

describe("date helpers", () => {
  it("toDateKey formats local YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 5, 15, 30, 0);
    expect(toDateKey(date)).toBe("2026-01-05");
  });

  it("fromDateKey round-trips with midday", () => {
    const date = fromDateKey("2026-02-18");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(18);
    expect(toDateKey(date)).toBe("2026-02-18");
  });

  it("addDays crosses month boundaries", () => {
    const start = new Date(2026, 0, 30, 12, 0, 0);
    expect(toDateKey(addDays(start, 3))).toBe("2026-02-02");
  });

  it("isWeekday detects Mon-Fri", () => {
    // 2026-02-16 is Monday
    expect(isWeekday(new Date(2026, 1, 16))).toBe(true);
    // 2026-02-15 is Sunday
    expect(isWeekday(new Date(2026, 1, 15))).toBe(false);
  });

  it("isSameDay and isFutureDay", () => {
    const a = new Date(2026, 6, 15, 8, 0, 0);
    const b = new Date(2026, 6, 15, 23, 0, 0);
    const c = new Date(2026, 6, 16, 1, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
    expect(isFutureDay(c, a)).toBe(true);
    expect(isFutureDay(a, c)).toBe(false);
  });
});
