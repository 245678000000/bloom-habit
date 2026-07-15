"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { toDateKey } from "@/lib/date";
import { CURRENT_VERSION, migrateStore } from "@/lib/migrate-store";
import { Habit, HabitDeleteSnapshot, HabitInput, HabitStore } from "@/lib/types";

const STORAGE_KEY = "bloom-habit-store-v1";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `habit-${crypto.randomUUID()}`;
  }
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-breathing",
    name: "呼吸冥想",
    emoji: "🫧",
    color: "#A8CABA",
    frequency: "daily",
    note: "闭眼 5 分钟，慢慢呼吸",
    archived: false,
    createdAt: toDateKey(new Date()),
    sortOrder: 0
  },
  {
    id: "habit-water",
    name: "补水",
    emoji: "💧",
    color: "#7FB3D5",
    frequency: "daily",
    note: "今天至少喝 6 杯水",
    archived: false,
    createdAt: toDateKey(new Date()),
    sortOrder: 1
  },
  {
    id: "habit-read",
    name: "阅读 20 分钟",
    emoji: "📖",
    color: "#D7C9E8",
    frequency: "weekdays",
    note: "让心沉静下来",
    archived: false,
    createdAt: toDateKey(new Date()),
    sortOrder: 2
  },
  {
    id: "habit-walk",
    name: "散步",
    emoji: "🌿",
    color: "#F4C6A0",
    frequency: "daily",
    note: "到户外走走，晒晒太阳",
    archived: false,
    createdAt: toDateKey(new Date()),
    sortOrder: 3
  }
];

const INITIAL_STATE: HabitStore = {
  version: CURRENT_VERSION,
  displayName: "Windy",
  habits: DEFAULT_HABITS,
  completions: {},
  reminderEnabled: false,
  reminderTime: "20:00",
  restDays: []
};

type Action =
  | { type: "hydrate"; payload: HabitStore }
  | { type: "set-name"; payload: string }
  | { type: "add-habit"; payload: HabitInput }
  | { type: "update-habit"; payload: Habit }
  | { type: "delete-habit"; payload: string }
  | { type: "restore-habit"; payload: HabitDeleteSnapshot }
  | { type: "archive-habit"; payload: string }
  | { type: "move-habit"; payload: { habitId: string; direction: "up" | "down" } }
  | { type: "toggle-completion"; payload: { dateKey: string; habitId: string } }
  | { type: "toggle-rest-day"; payload: { dateKey: string } }
  | { type: "set-reminder"; payload: { enabled: boolean; time: string } }
  | { type: "import-store"; payload: HabitStore }
  | { type: "reset" };

function nextSortOrderForNew(habits: Habit[]) {
  if (!habits.length) return 0;
  return Math.min(...habits.map((h) => h.sortOrder)) - 1;
}

function reorderActive(habits: Habit[], habitId: string, direction: "up" | "down"): Habit[] {
  const active = habits
    .filter((h) => !h.archived)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  const index = active.findIndex((h) => h.id === habitId);
  if (index < 0) return habits;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= active.length) return habits;

  const a = active[index];
  const b = active[swapWith];
  const orderA = a.sortOrder;
  const orderB = b.sortOrder;
  const nextOrderA = orderA === orderB ? swapWith : orderB;
  const nextOrderB = orderA === orderB ? index : orderA;

  return habits.map((habit) => {
    if (habit.id === a.id) return { ...habit, sortOrder: nextOrderA };
    if (habit.id === b.id) return { ...habit, sortOrder: nextOrderB };
    return habit;
  });
}

function buildDeleteSnapshot(state: HabitStore, habitId: string): HabitDeleteSnapshot | null {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return null;
  const completionSlices: Record<string, string[]> = {};
  for (const [key, ids] of Object.entries(state.completions)) {
    if (ids.includes(habitId)) {
      completionSlices[key] = [...ids];
    }
  }
  return { habit: { ...habit }, completionSlices };
}

function reducer(state: HabitStore, action: Action): HabitStore {
  switch (action.type) {
    case "hydrate":
    case "import-store":
      return { ...action.payload, version: CURRENT_VERSION };
    case "set-name":
      return {
        ...state,
        displayName: action.payload.trim() || "Windy"
      };
    case "add-habit": {
      const newHabit: Habit = {
        ...action.payload,
        id: createId(),
        archived: false,
        createdAt: toDateKey(new Date()),
        sortOrder: nextSortOrderForNew(state.habits)
      };
      return {
        ...state,
        habits: [newHabit, ...state.habits]
      };
    }
    case "update-habit":
      return {
        ...state,
        habits: state.habits.map((habit) => (habit.id === action.payload.id ? action.payload : habit))
      };
    case "delete-habit": {
      const habits = state.habits.filter((habit) => habit.id !== action.payload);
      const completions = Object.fromEntries(
        Object.entries(state.completions).map(([key, ids]) => [
          key,
          ids.filter((id) => id !== action.payload)
        ])
      );
      return { ...state, habits, completions };
    }
    case "restore-habit": {
      const { habit, completionSlices } = action.payload;
      const withoutDup = state.habits.filter((h) => h.id !== habit.id);
      const completions = { ...state.completions };
      for (const [key, ids] of Object.entries(completionSlices)) {
        const existing = new Set(completions[key] ?? []);
        for (const id of ids) existing.add(id);
        // Ensure the restored habit id is present if it was in the snapshot list
        if (ids.includes(habit.id)) existing.add(habit.id);
        completions[key] = Array.from(existing);
      }
      // Prefer exact snapshot lists for keys we tracked
      for (const [key, ids] of Object.entries(completionSlices)) {
        completions[key] = [...ids];
      }
      return {
        ...state,
        habits: [habit, ...withoutDup],
        completions
      };
    }
    case "archive-habit":
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload ? { ...habit, archived: !habit.archived } : habit
        )
      };
    case "move-habit":
      return {
        ...state,
        habits: reorderActive(state.habits, action.payload.habitId, action.payload.direction)
      };
    case "toggle-completion": {
      const current = state.completions[action.payload.dateKey] ?? [];
      const exists = current.includes(action.payload.habitId);
      const nextList = exists
        ? current.filter((id) => id !== action.payload.habitId)
        : [...current, action.payload.habitId];

      return {
        ...state,
        completions: {
          ...state.completions,
          [action.payload.dateKey]: nextList
        }
      };
    }
    case "toggle-rest-day": {
      const exists = state.restDays.includes(action.payload.dateKey);
      return {
        ...state,
        restDays: exists
          ? state.restDays.filter((d) => d !== action.payload.dateKey)
          : [...state.restDays, action.payload.dateKey]
      };
    }
    case "set-reminder":
      return {
        ...state,
        reminderEnabled: action.payload.enabled,
        reminderTime: action.payload.time
      };
    case "reset":
      return {
        ...INITIAL_STATE,
        habits: DEFAULT_HABITS.map((habit, index) => ({
          ...habit,
          createdAt: toDateKey(new Date()),
          sortOrder: index
        })),
        restDays: []
      };
    default:
      return state;
  }
}

interface HabitContextValue {
  state: HabitStore;
  hydrated: boolean;
  setName: (name: string) => void;
  addHabit: (input: HabitInput) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => HabitDeleteSnapshot | null;
  restoreHabit: (snapshot: HabitDeleteSnapshot) => void;
  toggleArchiveHabit: (habitId: string) => void;
  moveHabit: (habitId: string, direction: "up" | "down") => void;
  toggleCompletion: (habitId: string, date?: Date) => void;
  toggleRestDay: (date?: Date) => void;
  setReminder: (enabled: boolean, time: string) => void;
  importStore: (store: HabitStore) => void;
  resetAll: () => void;
}

const HabitContext = createContext<HabitContextValue | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const migrated = migrateStore(parsed);
        if (migrated) {
          dispatch({ type: "hydrate", payload: migrated });
        }
      }
    } catch {
      // keep defaults when parse fails
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<HabitContextValue>(
    () => ({
      state,
      hydrated,
      setName: (name) => dispatch({ type: "set-name", payload: name }),
      addHabit: (input) => dispatch({ type: "add-habit", payload: input }),
      updateHabit: (habit) => dispatch({ type: "update-habit", payload: habit }),
      deleteHabit: (habitId) => {
        const snapshot = buildDeleteSnapshot(state, habitId);
        dispatch({ type: "delete-habit", payload: habitId });
        return snapshot;
      },
      restoreHabit: (snapshot) => dispatch({ type: "restore-habit", payload: snapshot }),
      toggleArchiveHabit: (habitId) => dispatch({ type: "archive-habit", payload: habitId }),
      moveHabit: (habitId, direction) =>
        dispatch({ type: "move-habit", payload: { habitId, direction } }),
      toggleCompletion: (habitId, date = new Date()) =>
        dispatch({
          type: "toggle-completion",
          payload: { dateKey: toDateKey(date), habitId }
        }),
      toggleRestDay: (date = new Date()) =>
        dispatch({ type: "toggle-rest-day", payload: { dateKey: toDateKey(date) } }),
      setReminder: (enabled, time) =>
        dispatch({ type: "set-reminder", payload: { enabled, time } }),
      importStore: (store) => {
        const migrated = migrateStore(store);
        if (migrated) {
          dispatch({ type: "import-store", payload: migrated });
        }
      },
      resetAll: () => dispatch({ type: "reset" })
    }),
    [state, hydrated]
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabitStore() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabitStore must be used within HabitProvider");
  }
  return context;
}
