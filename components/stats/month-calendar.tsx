"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatYearMonth, getMonthGrid, shiftMonth, WEEKDAY_HEADERS_MON } from "@/lib/calendar";
import { HabitStore } from "@/lib/types";
import { getDayCompletionRatio, isRestDay } from "@/lib/habit-metrics";
import { cn } from "@/lib/utils";

const levels = [
  "bg-[#edf6f0] dark:bg-[#29342e]",
  "bg-[#dff0e7] dark:bg-[#355247]",
  "bg-[#c8e2d3] dark:bg-[#486d5f]",
  "bg-[#a8caba] dark:bg-[#638f7d]",
  "bg-[#84b39a] dark:bg-[#79ae93]"
];

function level(ratio: number) {
  if (ratio <= 0) return 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.95) return 3;
  return 4;
}

interface MonthCalendarProps {
  state: HabitStore;
  year: number;
  month: number;
  selectedKey: string | null;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (key: string) => void;
}

export function MonthCalendar({
  state,
  year,
  month,
  selectedKey,
  onMonthChange,
  onSelectDay
}: MonthCalendarProps) {
  const grid = getMonthGrid(year, month);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>月历热力</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="上个月"
            onClick={() => {
              const next = shiftMonth(year, month, -1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[6.5rem] text-center text-sm font-semibold text-[#4d6357] dark:text-[#cadad1]">
            {formatYearMonth(year, month)}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label="下个月"
            onClick={() => {
              const next = shiftMonth(year, month, 1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-[11px] text-[#80948a] dark:text-[#95aa9f]">周一为一周起点 · 斜纹为休息日</p>
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] text-[#7a8f84] dark:text-[#9eb2a8]">
          {WEEKDAY_HEADERS_MON.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((cell) => {
            const rest = isRestDay(state, cell.date);
            const ratio = getDayCompletionRatio(state, cell.date);
            const selected = selectedKey === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!cell.inMonth}
                onClick={() => cell.inMonth && onSelectDay(cell.key)}
                className={cn(
                  "relative flex h-10 flex-col items-center justify-center rounded-xl border text-[11px] transition",
                  !cell.inMonth && "pointer-events-none opacity-0",
                  cell.inMonth && !rest && levels[level(ratio)],
                  cell.inMonth &&
                    rest &&
                    "border-dashed border-[#c4b8d8]/80 bg-[repeating-linear-gradient(-45deg,#efe8f8,#efe8f8_3px,#e4d9f0_3px,#e4d9f0_6px)] dark:border-[#6a5d7d]",
                  cell.inMonth && !rest && "border-white/40",
                  selected && "ring-2 ring-[#a8caba]"
                )}
                title={rest ? `${cell.key} 休息` : `${cell.key} ${Math.round(ratio * 100)}%`}
              >
                <span
                  className={cn(
                    "font-semibold",
                    cell.inMonth ? "text-[#3d5248] dark:text-[#d3e3d9]" : "text-transparent"
                  )}
                >
                  {cell.day}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
