import { Habit, HabitFrequency, HabitStore } from "@/lib/types";
import { toDateKey } from "@/lib/date";
import { migrateStore } from "@/lib/migrate-store";

const FREQUENCIES: HabitFrequency[] = ["daily", "weekdays", "weekly", "custom"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHabitFrequency(value: unknown): value is HabitFrequency {
  return typeof value === "string" && (FREQUENCIES as string[]).includes(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isInteger(item));
}

export function isValidHabit(value: unknown): value is Habit {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || !value.id) return false;
  if (typeof value.name !== "string") return false;
  if (typeof value.emoji !== "string") return false;
  if (typeof value.color !== "string") return false;
  if (!isHabitFrequency(value.frequency)) return false;
  if (typeof value.note !== "string") return false;
  if (typeof value.archived !== "boolean") return false;
  if (typeof value.createdAt !== "string") return false;
  if (value.daysOfWeek !== undefined && !isNumberArray(value.daysOfWeek)) return false;
  if (value.sortOrder !== undefined && typeof value.sortOrder !== "number") return false;
  return true;
}

export function parseImportedStore(raw: unknown): { ok: true; store: HabitStore } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "备份文件格式无效，需要 JSON 对象。" };
  }

  if (typeof raw.displayName !== "string") {
    return { ok: false, error: "缺少有效的 displayName。" };
  }

  if (!Array.isArray(raw.habits) || raw.habits.length === 0) {
    // allow empty habits list for backup of "cleared" state? Plan says habits array - empty ok
    if (!Array.isArray(raw.habits)) {
      return { ok: false, error: "habits 列表无效。" };
    }
  }

  if (raw.habits.some((habit) => !isValidHabit(habit) && !isRecord(habit))) {
    return { ok: false, error: "habits 列表包含无法识别的条目。" };
  }

  // Soft validation: each habit needs core fields; migrate will fill the rest
  for (const habit of raw.habits) {
    if (!isRecord(habit)) {
      return { ok: false, error: "habits 列表无效或缺少必要字段。" };
    }
    if (typeof habit.id !== "string" || typeof habit.name !== "string") {
      return { ok: false, error: "habits 列表无效或缺少必要字段。" };
    }
    if (typeof habit.frequency === "string" && !isHabitFrequency(habit.frequency)) {
      return { ok: false, error: `不支持的频率类型：${habit.frequency}` };
    }
  }

  if (!isRecord(raw.completions)) {
    return { ok: false, error: "completions 格式无效。" };
  }

  for (const [key, value] of Object.entries(raw.completions)) {
    if (!isStringArray(value)) {
      return { ok: false, error: `completions[${key}] 必须是字符串数组。` };
    }
  }

  const migrated = migrateStore(raw);
  if (!migrated) {
    return { ok: false, error: "备份数据无法迁移为当前版本。" };
  }

  return { ok: true, store: migrated };
}

export function exportStoreToFile(store: HabitStore) {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bloom-habit-backup-${toDateKey(new Date())}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function readStoreFromFile(file: File) {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false as const, error: "无法解析 JSON 文件。" };
  }
  return parseImportedStore(parsed);
}
