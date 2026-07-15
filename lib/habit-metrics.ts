import { addDays, getPastDates, toDateKey, isWeekday, fromDateKey } from "@/lib/date";
import { clamp } from "@/lib/utils";
import { Habit, HabitStore } from "@/lib/types";

export function getActiveHabits(habits: Habit[]) {
  return habits
    .filter((habit) => !habit.archived)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export function isRestDay(state: HabitStore, date: Date) {
  return state.restDays.includes(toDateKey(date));
}

export function isHabitDueOnDate(habit: Habit, date: Date) {
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return isWeekday(date);
  if (habit.frequency === "custom") {
    const days = habit.daysOfWeek ?? [];
    return days.includes(date.getDay());
  }
  const anchorDay = fromDateKey(habit.createdAt).getDay();
  return date.getDay() === anchorDay;
}

export function getDueHabitsOnDate(state: HabitStore, date: Date) {
  if (isRestDay(state, date)) return [];
  return getActiveHabits(state.habits).filter((habit) => isHabitDueOnDate(habit, date));
}

export function isHabitCompleted(state: HabitStore, date: Date, habitId: string) {
  const key = toDateKey(date);
  return Boolean(state.completions[key]?.includes(habitId));
}

export function getDayCompletionRatio(state: HabitStore, date: Date) {
  if (isRestDay(state, date)) return 0;
  const due = getDueHabitsOnDate(state, date);
  if (!due.length) return 0;
  const completed = due.filter((habit) => isHabitCompleted(state, date, habit.id)).length;
  return clamp(completed / due.length);
}

export function getDayDetail(state: HabitStore, date: Date) {
  const rest = isRestDay(state, date);
  const due = rest
    ? getActiveHabits(state.habits).filter((habit) => isHabitDueOnDate(habit, date))
    : getDueHabitsOnDate(state, date);

  return {
    rest,
    key: toDateKey(date),
    items: due.map((habit) => ({
      habit,
      completed: isHabitCompleted(state, date, habit.id)
    }))
  };
}

export function getCurrentStreak(state: HabitStore, start = new Date()) {
  if (!getActiveHabits(state.habits).length) return 0;
  let streak = 0;
  let cursor = new Date(start);
  let scannedDays = 0;
  while (scannedDays < 366) {
    if (isRestDay(state, cursor)) {
      cursor = addDays(cursor, -1);
      scannedDays += 1;
      continue;
    }
    const due = getDueHabitsOnDate(state, cursor);
    if (!due.length) {
      cursor = addDays(cursor, -1);
      scannedDays += 1;
      continue;
    }
    const ratio = getDayCompletionRatio(state, cursor);
    if (ratio >= 1) {
      streak += 1;
      cursor = addDays(cursor, -1);
      scannedDays += 1;
      continue;
    }
    break;
  }
  return streak;
}

export function getLongestStreak(state: HabitStore, scanDays = 180) {
  const dates = getPastDates(scanDays);
  let current = 0;
  let best = 0;
  for (const date of dates) {
    if (isRestDay(state, date)) continue;
    const due = getDueHabitsOnDate(state, date);
    if (!due.length) continue;
    const ratio = getDayCompletionRatio(state, date);
    if (ratio >= 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function getWeeklyHeatmap(state: HabitStore, days = 7) {
  return getPastDates(days).map((date) => {
    const rest = isRestDay(state, date);
    const ratio = getDayCompletionRatio(state, date);
    return {
      key: toDateKey(date),
      ratio,
      rest,
      label: date.toLocaleDateString("zh-CN", { weekday: "short" })
    };
  });
}

export function getMonthlyHeatmap(state: HabitStore, days = 35) {
  return getPastDates(days).map((date) => ({
    key: toDateKey(date),
    ratio: getDayCompletionRatio(state, date),
    rest: isRestDay(state, date)
  }));
}

export function getTotalCompletionRate(state: HabitStore, days = 30) {
  const dates = getPastDates(days);
  let totalDue = 0;
  let totalDone = 0;
  for (const date of dates) {
    const due = getDueHabitsOnDate(state, date);
    totalDue += due.length;
    totalDone += due.filter((habit) => isHabitCompleted(state, date, habit.id)).length;
  }
  if (!totalDue) return 0;
  return clamp(totalDone / totalDue);
}

export function getWeeklyTrend(state: HabitStore, weeks = 8) {
  const result: Array<{ label: string; value: number }> = [];
  const today = new Date();
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const end = addDays(today, -w * 7);
    const start = addDays(end, -6);
    let dueTotal = 0;
    let doneTotal = 0;
    for (let i = 0; i < 7; i += 1) {
      const date = addDays(start, i);
      const due = getDueHabitsOnDate(state, date);
      dueTotal += due.length;
      doneTotal += due.filter((habit) => isHabitCompleted(state, date, habit.id)).length;
    }
    const value = dueTotal ? doneTotal / dueTotal : 0;
    result.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, value: clamp(value) });
  }
  return result;
}

function findHabit(state: HabitStore, habitId: string) {
  return state.habits.find((h) => h.id === habitId);
}

export function getHabitCompletionRate(state: HabitStore, habitId: string, days = 30) {
  const habit = findHabit(state, habitId);
  if (!habit || habit.archived) return 0;
  const dates = getPastDates(days);
  let dueTotal = 0;
  let doneTotal = 0;
  for (const date of dates) {
    if (isRestDay(state, date)) continue;
    if (!isHabitDueOnDate(habit, date)) continue;
    dueTotal += 1;
    if (isHabitCompleted(state, date, habitId)) doneTotal += 1;
  }
  if (!dueTotal) return 0;
  return clamp(doneTotal / dueTotal);
}

export function getHabitCurrentStreak(state: HabitStore, habitId: string, start = new Date()) {
  const habit = findHabit(state, habitId);
  if (!habit || habit.archived) return 0;
  let streak = 0;
  let cursor = new Date(start);
  let scanned = 0;
  while (scanned < 366) {
    if (isRestDay(state, cursor)) {
      cursor = addDays(cursor, -1);
      scanned += 1;
      continue;
    }
    if (!isHabitDueOnDate(habit, cursor)) {
      cursor = addDays(cursor, -1);
      scanned += 1;
      continue;
    }
    if (isHabitCompleted(state, cursor, habitId)) {
      streak += 1;
      cursor = addDays(cursor, -1);
      scanned += 1;
      continue;
    }
    break;
  }
  return streak;
}

export function getHabitLongestStreak(state: HabitStore, habitId: string, scanDays = 180) {
  const habit = findHabit(state, habitId);
  if (!habit) return 0;
  const dates = getPastDates(scanDays);
  let current = 0;
  let best = 0;
  for (const date of dates) {
    if (isRestDay(state, date)) continue;
    if (!isHabitDueOnDate(habit, date)) continue;
    if (isHabitCompleted(state, date, habitId)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
