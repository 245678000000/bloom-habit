import { describe, expect, it } from "vitest";

import { getMonthGrid, shiftMonth } from "@/lib/calendar";

describe("calendar", () => {
  it("builds Monday-first grid for a month", () => {
    // July 2026: 1st is Wednesday
    const grid = getMonthGrid(2026, 6);
    const inMonth = grid.filter((c) => c.inMonth);
    expect(inMonth).toHaveLength(31);
    expect(inMonth[0].day).toBe(1);
    expect(inMonth[0].key).toBe("2026-07-01");
    // first cell should be Monday June 29
    expect(grid[0].key).toBe("2026-06-29");
  });

  it("shifts month across year boundary", () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  });
});
