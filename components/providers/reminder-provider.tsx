"use client";

import { useEffect, useRef } from "react";

import { useHabitStore } from "@/components/providers/habit-provider";
import { toDateKey } from "@/lib/date";
import { getDayCompletionRatio, getDueHabitsOnDate } from "@/lib/habit-metrics";

const LAST_NOTIFIED_KEY = "bloom-habit-last-reminder";

function parseReminderMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 20 * 60;
  return h * 60 + m;
}

/**
 * Lightweight in-app reminder: checks while the app is open.
 * Browsers cannot guarantee exact background alarms without push infrastructure.
 */
export function ReminderWatcher() {
  const { state, hydrated } = useHabitStore();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!state.reminderEnabled) return;
    if (Notification.permission !== "granted") return;

    const tick = () => {
      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const target = parseReminderMinutes(state.reminderTime);
      // fire within the target minute window
      if (minutesNow < target || minutesNow > target + 1) return;

      const todayKey = toDateKey(now);
      const last = window.localStorage.getItem(LAST_NOTIFIED_KEY);
      if (last === todayKey) return;

      const due = getDueHabitsOnDate(state, now);
      if (!due.length) return;
      const ratio = getDayCompletionRatio(state, now);
      if (ratio >= 1) return;

      const remaining = due.length - Math.round(ratio * due.length);
      new Notification("Bloom Habit · 温柔提醒", {
        body: `今天还有习惯等你点亮，还差一点点就开花了～（约 ${remaining || due.length} 项）`,
        icon: "/icons/icon.svg",
        tag: `bloom-reminder-${todayKey}`
      });
      window.localStorage.setItem(LAST_NOTIFIED_KEY, todayKey);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 30_000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [hydrated, state]);

  return null;
}
