import { fromDateKey, toDateKey, withMidday } from "@/lib/date";

export interface MonthCell {
  key: string;
  date: Date;
  inMonth: boolean;
  day: number;
}

/**
 * Build a Monday-first month grid (6 weeks × 7 days = 42 cells when needed).
 * month is 0-indexed (Date convention).
 */
export function getMonthGrid(year: number, month: number): MonthCell[] {
  const first = withMidday(new Date(year, month, 1));
  // Monday = 0 … Sunday = 6
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = withMidday(new Date(year, month, 1 - mondayIndex));

  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = withMidday(new Date(start));
    date.setDate(start.getDate() + i);
    const inMonth = date.getMonth() === month;
    cells.push({
      key: toDateKey(date),
      date,
      inMonth,
      day: date.getDate()
    });
    // stop after covering the month if we're past week boundary
    if (i >= 27 && inMonth === false && date.getDay() === 0) {
      // keep filling until end of week (Sunday in Mon-first grid is index 6)
    }
  }

  // Trim trailing weeks that are entirely outside the month
  while (cells.length > 28) {
    const lastWeek = cells.slice(-7);
    if (lastWeek.every((c) => !c.inMonth)) {
      cells.splice(cells.length - 7, 7);
    } else {
      break;
    }
  }

  return cells;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function formatYearMonth(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

export function isValidDateKey(key: string) {
  try {
    const d = fromDateKey(key);
    return toDateKey(d) === key;
  } catch {
    return false;
  }
}

export const WEEKDAY_HEADERS_MON = ["一", "二", "三", "四", "五", "六", "日"];
