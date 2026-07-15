"use client";

import { useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getActiveHabits,
  getHabitCompletionRate,
  getHabitCurrentStreak,
  getHabitLongestStreak
} from "@/lib/habit-metrics";
import { HabitStore } from "@/lib/types";

export function HabitBreakdown({ state }: { state: HabitStore }) {
  const rows = useMemo(() => {
    return getActiveHabits(state.habits).map((habit) => ({
      habit,
      rate: Math.round(getHabitCompletionRate(state, habit.id, 30) * 100),
      current: getHabitCurrentStreak(state, habit.id),
      longest: getHabitLongestStreak(state, habit.id)
    }));
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>按习惯洞察</CardTitle>
        <CardDescription>近 30 天完成率 · 当前 / 最长连胜</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map(({ habit, rate, current, longest }) => (
            <div
              key={habit.id}
              className="rounded-3xl border border-white/55 bg-white/65 p-4 dark:border-white/10 dark:bg-[#25302b]/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#3b4f45] dark:text-[#d5e4dc]">
                    <span className="mr-2">{habit.emoji}</span>
                    {habit.name}
                  </p>
                  <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/70 dark:bg-[#1c2621]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#a8caba] to-[#f4c6a0]"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#3d5248] dark:text-[#d3e3d9]">{rate}%</p>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-[#7a8f84] dark:text-[#9eb2a8]">
                <span>当前连胜 {current} 天</span>
                <span>最长 {longest} 天</span>
              </div>
            </div>
          ))}
          {!rows.length && (
            <p className="text-sm text-[#80948a] dark:text-[#95aa9f]">暂无进行中的习惯</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
