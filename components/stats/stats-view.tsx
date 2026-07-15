"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, CalendarCheck2, Check, Circle } from "lucide-react";

import { useHabitStore } from "@/components/providers/habit-provider";
import { HabitBreakdown } from "@/components/stats/habit-breakdown";
import { MonthCalendar } from "@/components/stats/month-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fromDateKey, toDateKey } from "@/lib/date";
import {
  getDayDetail,
  getLongestStreak,
  getTotalCompletionRate,
  getWeeklyTrend
} from "@/lib/habit-metrics";

export function StatsView() {
  const { state, hydrated } = useHabitStore();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(() => toDateKey(now));

  const longestStreak = useMemo(() => getLongestStreak(state), [state]);
  const completionRate = useMemo(() => getTotalCompletionRate(state) * 100, [state]);
  const trend = useMemo(() => getWeeklyTrend(state), [state]);
  const dayDetail = useMemo(() => {
    if (!selectedKey) return null;
    return getDayDetail(state, fromDateKey(selectedKey));
  }, [state, selectedKey]);

  if (!hydrated) return <Card className="h-40 animate-pulse" />;

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Trophy className="h-5 w-5 text-[#ef9c62]" />
            <div>
              <p className="text-xs text-[#7a8f84] dark:text-[#9eb2a8]">最长连胜</p>
              <p className="text-2xl font-extrabold text-[#3d5248] dark:text-[#d3e3d9]">{longestStreak} 天</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Target className="h-5 w-5 text-[#86b69d]" />
            <div>
              <p className="text-xs text-[#7a8f84] dark:text-[#9eb2a8]">总完成率</p>
              <p className="text-2xl font-extrabold text-[#3d5248] dark:text-[#d3e3d9]">
                {Math.round(completionRate)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <CalendarCheck2 className="h-5 w-5 text-[#b89ed3]" />
            <div>
              <p className="text-xs text-[#7a8f84] dark:text-[#9eb2a8]">近30天状态</p>
              <p className="text-2xl font-extrabold text-[#3d5248] dark:text-[#d3e3d9]">
                {completionRate >= 70 ? "稳定绽放" : completionRate >= 40 ? "持续生长" : "正在发芽"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MonthCalendar
        state={state}
        year={year}
        month={month}
        selectedKey={selectedKey}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        onSelectDay={setSelectedKey}
      />

      {dayDetail && (
        <Card>
          <CardHeader>
            <CardTitle>日明细 · {dayDetail.key}</CardTitle>
            <CardDescription>
              {dayDetail.rest
                ? "休息日：不计入连胜中断；下方为若未休息时本会 due 的习惯（仅参考）"
                : "当日习惯完成情况（只读，补打卡请回首页）"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dayDetail.rest && (
              <p className="mb-3 rounded-2xl bg-[#efe8f8]/80 px-3 py-2 text-sm text-[#6a5d7d] dark:bg-[#2a2433] dark:text-[#cfc3e0]">
                这天标记为休息
              </p>
            )}
            <div className="space-y-2">
              {dayDetail.items.map(({ habit, completed }) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-2xl bg-white/55 px-4 py-3 dark:bg-[#24302b]/75"
                >
                  <p className="text-sm text-[#3b4f45] dark:text-[#d5e4dc]">
                    {habit.emoji} {habit.name}
                  </p>
                  {completed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5a8f74]">
                      <Check className="h-3.5 w-3.5" /> 已完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#8a9a90]">
                      <Circle className="h-3.5 w-3.5" /> 未完成
                    </span>
                  )}
                </div>
              ))}
              {!dayDetail.items.length && (
                <p className="text-sm text-[#80948a] dark:text-[#95aa9f]">这一天没有安排习惯</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <HabitBreakdown state={state} />

      <Card>
        <CardHeader>
          <CardTitle>趋势柱状图（每周）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-52 items-end gap-2 rounded-3xl bg-white/55 p-4 dark:bg-[#223028]/72">
            {trend.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(item.value * 100, 6)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-xl bg-gradient-to-t from-[#a8caba] to-[#f4c6a0] dark:from-[#699984] dark:to-[#8e715f]"
                />
                <span className="text-[11px] text-[#7a8f84] dark:text-[#9eb2a8]">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
