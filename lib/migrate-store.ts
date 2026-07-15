import { Habit, HabitFrequency, HabitStore } from "@/lib/types";

export const CURRENT_VERSION = 3;

const VALID_FREQUENCIES: HabitFrequency[] = ["daily", "weekdays", "weekly", "custom"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFrequency(value: unknown): HabitFrequency {
  if (typeof value === "string" && (VALID_FREQUENCIES as string[]).includes(value)) {
    return value as HabitFrequency;
  }
  return "daily";
}

function normalizeDaysOfWeek(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const days = value
    .filter((d): d is number => typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6)
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort((a, b) => a - b);
  return days.length ? days : undefined;
}

function normalizeRestDays(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((key): key is string => typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key))
    .filter((key, i, arr) => arr.indexOf(key) === i);
}

function normalizeHabit(raw: unknown, index: number): Habit | null {
  if (!isRecord(raw)) return null;

  const id = typeof raw.id === "string" && raw.id ? raw.id : `habit-migrated-${index}`;
  const name = typeof raw.name === "string" ? raw.name : "未命名习惯";
  const emoji = typeof raw.emoji === "string" && raw.emoji ? raw.emoji : "🌱";
  const color = typeof raw.color === "string" && raw.color ? raw.color : "#A8CABA";
  const frequency = normalizeFrequency(raw.frequency);
  const note = typeof raw.note === "string" ? raw.note : "";
  const archived = typeof raw.archived === "boolean" ? raw.archived : false;
  const createdAt = typeof raw.createdAt === "string" && raw.createdAt ? raw.createdAt : "1970-01-01";
  const sortOrder = typeof raw.sortOrder === "number" && Number.isFinite(raw.sortOrder) ? raw.sortOrder : index;
  const daysOfWeek =
    frequency === "custom"
      ? normalizeDaysOfWeek(raw.daysOfWeek) ?? [1, 3, 5]
      : normalizeDaysOfWeek(raw.daysOfWeek);

  return {
    id,
    name,
    emoji,
    color,
    frequency,
    ...(daysOfWeek ? { daysOfWeek } : {}),
    note,
    archived,
    createdAt,
    sortOrder
  };
}

/**
 * Normalize any stored/imported payload into the current HabitStore shape.
 * Returns null when the payload is unusable.
 */
export function migrateStore(raw: unknown): HabitStore | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.displayName !== "string") return null;
  if (!Array.isArray(raw.habits)) return null;
  if (!isRecord(raw.completions)) return null;

  const habits = raw.habits
    .map((habit, index) => normalizeHabit(habit, index))
    .filter((habit): habit is Habit => habit !== null);

  if (raw.habits.length > 0 && habits.length === 0) return null;

  const completions: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw.completions)) {
    if (Array.isArray(value) && value.every((id) => typeof id === "string")) {
      completions[key] = value as string[];
    }
  }

  const reminderTime =
    typeof raw.reminderTime === "string" && /^\d{2}:\d{2}$/.test(raw.reminderTime)
      ? raw.reminderTime
      : "20:00";

  return {
    version: CURRENT_VERSION,
    displayName: raw.displayName.trim() || "Windy",
    habits,
    completions,
    reminderEnabled: typeof raw.reminderEnabled === "boolean" ? raw.reminderEnabled : false,
    reminderTime,
    restDays: normalizeRestDays(raw.restDays)
  };
}
