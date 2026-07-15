"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Flame, Check, Sparkles, CalendarDays, Flower2, Moon } from "lucide-react";

import { useHabitStore } from "@/components/providers/habit-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatToday, fromDateKey, isSameDay, toDateKey } from "@/lib/date";
import {
  getActiveHabits,
  getCurrentStreak,
  getDayCompletionRatio,
  getDueHabitsOnDate,
  getWeeklyHeatmap,
  isHabitCompleted,
  isRestDay
} from "@/lib/habit-metrics";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { WeeklyHeatmap } from "@/components/dashboard/weekly-heatmap";
import { DateStrip } from "@/components/dashboard/date-strip";
import { cn } from "@/lib/utils";

interface BurstState {
  habitId: string;
  seed: number;
}

export function DashboardView() {
  const { state, hydrated, toggleCompletion, toggleRestDay } = useHabitStore();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState<BurstState | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const today = useMemo(() => new Date(), []);
  const isViewingToday = isSameDay(selectedDate, today);
  const resting = isRestDay(state, selectedDate);
  const activeCount = useMemo(() => getActiveHabits(state.habits).length, [state.habits]);

  const dueHabits = useMemo(() => getDueHabitsOnDate(state, selectedDate), [state, selectedDate]);
  const streak = useMemo(() => getCurrentStreak(state, today), [state, today]);
  const ratio = useMemo(() => getDayCompletionRatio(state, selectedDate), [state, selectedDate]);
  const heatmap = useMemo(() => getWeeklyHeatmap(state, 7), [state]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "早安";
    if (hour < 14) return "午安";
    if (hour < 19) return "下午好";
    return "晚上好";
  }, []);

  if (!hydrated) {
    return (
      <div className="space-y-4 pt-3">
        <Card className="h-24 animate-pulse" />
        <Card className="h-32 animate-pulse" />
        <Card className="h-72 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 md:space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-8">
          <CardContent className="relative py-4 md:py-5">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#f4c6a0]/40 blur-2xl" />
            <p className="text-sm text-[#6d8075] dark:text-[#a3b5aa] md:text-base">
              {`${greeting}，${state.displayName}～今天也要开花哦`}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[#4d6357] dark:text-[#cadad1]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-sm md:text-[15px]">{formatToday(new Date())}</p>
            </div>
            <div className="mt-4">
              <DateStrip
                selectedDate={selectedDate}
                today={today}
                onSelect={setSelectedDate}
                onBackToToday={() => setSelectedDate(new Date())}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant={resting ? "default" : "secondary"}
                onClick={() => {
                  toggleRestDay(selectedDate);
                  toast({
                    message: resting
                      ? `已取消 ${toDateKey(selectedDate)} 的休息`
                      : `${toDateKey(selectedDate)} 已标记为休息日，不打断连胜`,
                    variant: "success",
                    action: {
                      label: "撤销",
                      onClick: () => toggleRestDay(selectedDate)
                    }
                  });
                }}
              >
                <Moon className="h-4 w-4" />
                {resting ? "取消休息" : "这天休息"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="lg:col-span-4"
          initial={reduceMotion ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="h-full bg-gradient-to-br from-[#fff5ed]/90 via-[#f0f8f3]/90 to-[#efe8fa]/86 dark:from-[#243129] dark:via-[#1f2c25] dark:to-[#2f2637]">
            <CardContent className="flex h-full items-center justify-between py-4 md:py-5 lg:flex-col lg:items-start lg:justify-center lg:gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={
                    reduceMotion ? undefined : { rotate: [0, -6, 6, -4, 0], y: [0, -2, 0] }
                  }
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(!reduceMotion && "fire-sway")}
                >
                  <Flame className="h-10 w-10 fill-[#f4a96d] text-[#f08f52] lg:h-12 lg:w-12" />
                </motion.div>
                <div>
                  <p className="text-4xl font-black leading-none text-[#4b5e54] dark:text-[#d5e5db] lg:text-5xl">
                    {streak}
                  </p>
                  <p className="text-sm text-[#7a8d82] dark:text-[#a1b6aa]">天连胜</p>
                </div>
              </div>
              <Badge variant="peach" className="rounded-full px-3 py-1.5 text-xs">
                Keep Blooming
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {!activeCount ? (
        <Card>
          <CardContent className="py-10 text-center md:py-14">
            <Flower2 className="mx-auto mb-3 h-8 w-8 text-[#84b39a]" />
            <p className="text-base font-semibold text-[#3b4f45] dark:text-[#d5e4dc]">还没有进行中的习惯</p>
            <p className="mt-1 text-sm text-[#7a8f84] dark:text-[#9eb2a8]">先种下一颗小小种子吧</p>
            <Link
              href="/habits"
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-sage to-[#96c0ad] px-3 text-xs font-semibold text-[#1d2c25] shadow-soft dark:from-[#80a894] dark:to-[#719b88] dark:text-white"
            >
              去习惯库添加
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{isViewingToday ? "今日完成环形进度" : "当日完成环形进度"}</CardTitle>
            <CardDescription>
              {resting ? "休息日不计入完成率与连胜中断" : "每个勾选都在悄悄积累能量"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resting ? (
              <div className="rounded-3xl bg-white/55 py-10 text-center dark:bg-[#223028]/72">
                <Moon className="mx-auto mb-2 h-8 w-8 text-[#9a8bb5]" />
                <p className="font-semibold text-[#5a4f6a] dark:text-[#d2c8e4]">好好休息的一天</p>
                <p className="mt-1 text-sm text-[#7a8f84] dark:text-[#9eb2a8]">连胜会为你温柔保留</p>
              </div>
            ) : (
              <ProgressRing value={ratio * 100} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>
              {resting
                ? isViewingToday
                  ? "今日休息"
                  : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 · 休息`
                : isViewingToday
                  ? "今日习惯"
                  : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日习惯`}
            </CardTitle>
            <CardDescription>
              {resting
                ? "取消休息后可恢复打卡；休息日不会打断连胜"
                : dueHabits.length
                  ? isViewingToday
                    ? "每次打卡，都是一次小小绽放"
                    : "可以补记这一天的打卡"
                  : isViewingToday
                    ? "今天没有安排，记得休息"
                    : "这一天没有安排习惯"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resting ? (
              <p className="text-sm text-[#7a8f84] dark:text-[#9eb2a8]">此日已标记休息，习惯清单已隐藏。</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {dueHabits.map((habit) => {
                  const done = isHabitCompleted(state, selectedDate, habit.id);
                  return (
                    <motion.div
                      key={habit.id}
                      layout={!reduceMotion}
                      className={cn(
                        "relative flex items-center justify-between rounded-3xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition",
                        done
                          ? "border-[#b3d9c4] bg-[#ebf7f0] dark:border-[#5b8c75] dark:bg-[#243930]"
                          : "border-white/60 bg-white/65 dark:border-white/10 dark:bg-[#25302b]/74"
                      )}
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                    >
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-[#3b4f45] dark:text-[#d7e4dc]">
                          <span className="mr-2 text-xl">{habit.emoji}</span>
                          {habit.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-[#788b80] dark:text-[#9cb0a5]">
                          {habit.note || "今天也温柔完成它"}
                        </p>
                      </div>
                      <div className="relative shrink-0">
                        <Button
                          size="sm"
                          className={cn(
                            "rounded-full px-4",
                            done &&
                              "bg-gradient-to-br from-[#9dd1b5] to-[#82be9f] text-white dark:from-[#629b7f]"
                          )}
                          onClick={() => {
                            const willComplete = !done;
                            toggleCompletion(habit.id, selectedDate);
                            if (willComplete && !reduceMotion) {
                              setBurst({ habitId: habit.id, seed: Date.now() });
                              setTimeout(() => setBurst(null), 700);
                            }
                            toast({
                              message: willComplete
                                ? `已打卡「${habit.name}」`
                                : `已取消「${habit.name}」`,
                              variant: "success",
                              action: {
                                label: "撤销",
                                onClick: () => toggleCompletion(habit.id, selectedDate)
                              }
                            });
                          }}
                        >
                          {done ? (
                            <>
                              <Check className="h-4 w-4" /> 已完成
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" /> 打卡
                            </>
                          )}
                        </Button>

                        <AnimatePresence>
                          {burst?.habitId === habit.id && (
                            <div className="pointer-events-none absolute inset-0">
                              {Array.from({ length: 10 }).map((_, index) => {
                                const x = (index - 5) * 8;
                                const y = -18 - (index % 3) * 9;
                                return (
                                  <motion.span
                                    key={`${burst.seed}-${index}`}
                                    className="sparkle"
                                    initial={{ x: 0, y: 0, opacity: 0.95, scale: 0.6 }}
                                    animate={{ x, y, opacity: 0, scale: 1.3 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.58, ease: "easeOut" }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WeeklyHeatmap
        data={heatmap}
        onSelectDate={(key) => {
          setSelectedDate(fromDateKey(key));
        }}
        selectedKey={toDateKey(selectedDate)}
      />
    </div>
  );
}
