"use client";

import { addDays, formatToday, getPastDates, isSameDay, toDateKey, weekdayShortLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  today?: Date;
  days?: number;
  onSelect: (date: Date) => void;
  onBackToToday: () => void;
}

export function DateStrip({
  selectedDate,
  today = new Date(),
  days = 14,
  onSelect,
  onBackToToday
}: DateStripProps) {
  const dates = getPastDates(days, today);
  const showingToday = isSameDay(selectedDate, today);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[#6d8075] dark:text-[#a3b5aa]">
          {showingToday ? "今天" : formatToday(selectedDate)}
          {!showingToday && <span className="ml-1 text-[#9a7d66]">· 补打卡</span>}
        </p>
        {!showingToday && (
          <button
            type="button"
            onClick={onBackToToday}
            className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#5f7469] shadow-soft dark:bg-[#2a342f] dark:text-[#b7c9be]"
          >
            回到今天
          </button>
        )}
      </div>
      <div className="soft-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dates.map((date) => {
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={toDateKey(date)}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-w-[3.25rem] flex-col items-center rounded-2xl border px-2 py-2 text-center transition",
                selected
                  ? "border-[#b3d9c4] bg-[#ebf7f0] text-[#355445] dark:border-[#5b8c75] dark:bg-[#243930] dark:text-[#d5e4dc]"
                  : "border-white/50 bg-white/60 text-[#70857a] hover:bg-white/80 dark:border-white/10 dark:bg-[#25302b]/70 dark:text-[#9db0a5]"
              )}
            >
              <span className="text-[10px] opacity-80">{weekdayShortLabel(date)}</span>
              <span className="text-sm font-bold">{date.getDate()}</span>
              {isToday && <span className="mt-0.5 h-1 w-1 rounded-full bg-[#84b39a]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** helper exported for tests / reuse */
export function clampSelectableDate(date: Date, today = new Date()) {
  const end = addDays(today, 0);
  if (toDateKey(date) > toDateKey(end)) return end;
  return date;
}
