export type HabitFrequency = "daily" | "weekdays" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: HabitFrequency;
  /** frequency === "custom" 时生效，0=周日 … 6=周六 */
  daysOfWeek?: number[];
  note: string;
  archived: boolean;
  createdAt: string;
  /** 越小越靠前 */
  sortOrder: number;
}

export interface HabitStore {
  version: number;
  displayName: string;
  habits: Habit[];
  completions: Record<string, string[]>;
  reminderEnabled: boolean;
  reminderTime: string;
  /** 休息日 dateKey 列表，不打断连胜 */
  restDays: string[];
}

export type HabitInput = Omit<Habit, "id" | "createdAt" | "archived" | "sortOrder"> & {
  daysOfWeek?: number[];
};

/** 删除撤销用快照 */
export interface HabitDeleteSnapshot {
  habit: Habit;
  /** dateKey → 是否包含该 habitId（删除前的原始列表） */
  completionSlices: Record<string, string[]>;
}
