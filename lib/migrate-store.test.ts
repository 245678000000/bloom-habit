import { describe, expect, it } from "vitest";

import { CURRENT_VERSION, migrateStore } from "@/lib/migrate-store";

describe("migrateStore", () => {
  it("migrates v1 payload without version/sortOrder/restDays", () => {
    const raw = {
      displayName: "Windy",
      habits: [
        {
          id: "habit-1",
          name: "阅读",
          emoji: "📖",
          color: "#D7C9E8",
          frequency: "weekdays",
          note: "",
          archived: false,
          createdAt: "2026-01-01"
        }
      ],
      completions: {
        "2026-01-02": ["habit-1"]
      }
    };

    const migrated = migrateStore(raw);
    expect(migrated).not.toBeNull();
    expect(migrated!.version).toBe(CURRENT_VERSION);
    expect(migrated!.habits[0].sortOrder).toBe(0);
    expect(migrated!.reminderEnabled).toBe(false);
    expect(migrated!.reminderTime).toBe("20:00");
    expect(migrated!.restDays).toEqual([]);
    expect(migrated!.completions["2026-01-02"]).toEqual(["habit-1"]);
  });

  it("fills custom daysOfWeek default when missing", () => {
    const migrated = migrateStore({
      displayName: "A",
      habits: [
        {
          id: "c1",
          name: "Custom",
          emoji: "✨",
          color: "#A8CABA",
          frequency: "custom",
          note: "",
          archived: false,
          createdAt: "2026-01-01"
        }
      ],
      completions: {}
    });
    expect(migrated!.habits[0].daysOfWeek).toEqual([1, 3, 5]);
  });

  it("keeps valid restDays", () => {
    const migrated = migrateStore({
      displayName: "A",
      habits: [],
      completions: {},
      restDays: ["2026-07-15", "bad", "2026-07-16"]
    });
    expect(migrated!.restDays).toEqual(["2026-07-15", "2026-07-16"]);
  });

  it("returns null for unusable payloads", () => {
    expect(migrateStore(null)).toBeNull();
    expect(migrateStore({})).toBeNull();
    expect(migrateStore({ displayName: "x", habits: "bad", completions: {} })).toBeNull();
  });
});
