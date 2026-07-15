"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ChevronDown, ChevronUp, Pencil, Plus, Trash2, Flower2 } from "lucide-react";

import { useHabitStore } from "@/components/providers/habit-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveHabits } from "@/lib/habit-metrics";
import { Habit, HabitFrequency, HabitInput } from "@/lib/types";

interface FormState {
  name: string;
  emoji: string;
  color: string;
  frequency: HabitFrequency;
  daysOfWeek: number[];
  note: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  emoji: "🌱",
  color: "#A8CABA",
  frequency: "daily",
  daysOfWeek: [1, 3, 5],
  note: ""
};

const EMOJI_PRESETS = ["🌱", "🫧", "💧", "📖", "🌿", "🏃", "🧘", "📝", "🎯", "☀️", "🌙", "💚"];

const WEEK_OPTIONS = [
  { value: 1, label: "一" },
  { value: 2, label: "二" },
  { value: 3, label: "三" },
  { value: 4, label: "四" },
  { value: 5, label: "五" },
  { value: 6, label: "六" },
  { value: 0, label: "日" }
];

function frequencyLabel(frequency: HabitFrequency) {
  if (frequency === "daily") return "每天";
  if (frequency === "weekdays") return "工作日";
  if (frequency === "custom") return "自定义";
  return "每周";
}

function toPayload(form: FormState): HabitInput {
  return {
    name: form.name.trim(),
    emoji: form.emoji.trim() || "🌱",
    color: form.color,
    frequency: form.frequency,
    note: form.note.trim(),
    ...(form.frequency === "custom" ? { daysOfWeek: form.daysOfWeek.length ? form.daysOfWeek : [1] } : {})
  };
}

export function HabitsView() {
  const {
    state,
    hydrated,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
    toggleArchiveHabit,
    moveHabit
  } = useHabitStore();
  const { toast } = useToast();

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const activeHabits = useMemo(() => getActiveHabits(state.habits), [state.habits]);
  const archivedHabits = useMemo(() => state.habits.filter((habit) => habit.archived), [state.habits]);
  const pendingDeleteName = state.habits.find((h) => h.id === pendingDeleteId)?.name;

  if (!hydrated) {
    return <Card className="h-44 animate-pulse" />;
  }

  const submit = () => {
    if (!form.name.trim()) {
      setFormError("请填写习惯名称");
      return;
    }
    if (form.frequency === "custom" && form.daysOfWeek.length === 0) {
      setFormError("请至少选择一个星期");
      return;
    }
    setFormError(null);
    if (editing) {
      updateHabit({
        ...editing,
        ...toPayload(form),
        daysOfWeek: form.frequency === "custom" ? form.daysOfWeek : undefined
      });
      toast({ message: "习惯已更新", variant: "success" });
    } else {
      addHabit(toPayload(form));
      toast({ message: "新习惯已种下", variant: "success" });
    }
    setForm(EMPTY_FORM);
    setEditing(null);
    setOpenForm(false);
  };

  const toggleDay = (day: number) => {
    setForm((prev) => {
      const exists = prev.daysOfWeek.includes(day);
      const daysOfWeek = exists
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b);
      return { ...prev, daysOfWeek };
    });
  };

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>习惯库</CardTitle>
          <CardDescription>创建专属你的温柔节律，慢慢长成理想生活。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => {
              setOpenForm((prev) => !prev);
              setEditing(null);
              setForm(EMPTY_FORM);
              setFormError(null);
            }}
          >
            <Plus className="h-4 w-4" /> 添加新习惯
          </Button>

          <AnimatePresence initial={false}>
            {openForm && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 rounded-3xl border border-white/50 bg-white/65 p-4 dark:border-white/10 dark:bg-[#25302b]/70">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="习惯名称"
                      value={form.name}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, name: e.target.value }));
                        if (formError) setFormError(null);
                      }}
                    />
                    <Input
                      placeholder="emoji"
                      value={form.emoji}
                      onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))}
                    />
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs text-[#708278] dark:text-[#99ac9f]">快捷 emoji</p>
                      <div className="flex flex-wrap gap-1.5">
                        {EMOJI_PRESETS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition ${
                              form.emoji === emoji
                                ? "bg-[#a8caba]/50 ring-2 ring-[#84b39a]"
                                : "bg-white/70 dark:bg-[#2a342f]"
                            }`}
                            onClick={() => setForm((prev) => ({ ...prev, emoji }))}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#708278] dark:text-[#99ac9f]">颜色</label>
                      <Input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                        className="h-11 p-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#708278] dark:text-[#99ac9f]">频率</label>
                      <select
                        className="h-11 w-full rounded-2xl border border-white/70 bg-white/70 px-4 text-sm text-[#3d5047] dark:border-white/10 dark:bg-[#25302b] dark:text-[#d1e1d8]"
                        value={form.frequency}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, frequency: e.target.value as HabitFrequency }))
                        }
                      >
                        <option value="daily">每天</option>
                        <option value="weekdays">工作日</option>
                        <option value="weekly">每周（按创建日星期）</option>
                        <option value="custom">自定义星期</option>
                      </select>
                    </div>
                  </div>

                  {form.frequency === "custom" && (
                    <div className="space-y-2">
                      <p className="text-xs text-[#708278] dark:text-[#99ac9f]">选择重复的星期</p>
                      <div className="flex flex-wrap gap-2">
                        {WEEK_OPTIONS.map((day) => {
                          const active = form.daysOfWeek.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                toggleDay(day.value);
                                if (formError) setFormError(null);
                              }}
                              className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                                active
                                  ? "bg-[#a8caba] text-[#1f332a] dark:bg-[#6f9b86] dark:text-white"
                                  : "bg-white/70 text-[#6d8176] dark:bg-[#2a342f] dark:text-[#9db0a5]"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Textarea
                    placeholder="备注（可选）"
                    value={form.note}
                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  />
                  {formError && <p className="text-sm text-[#c06b58] dark:text-[#e39b8a]">{formError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={submit} className="flex-1">
                      {editing ? "保存修改" : "创建习惯"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setOpenForm(false);
                        setEditing(null);
                        setForm(EMPTY_FORM);
                        setFormError(null);
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>进行中 ({activeHabits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeHabits.map((habit, index) => (
              <div
                key={habit.id}
                className="rounded-3xl border border-white/55 bg-white/65 p-4 dark:border-white/10 dark:bg-[#25302b]/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#3b4f45] dark:text-[#d5e4dc]">
                      <span className="mr-2">{habit.emoji}</span>
                      {habit.name}
                    </p>
                    <p className="mt-1 text-sm text-[#73867c] dark:text-[#9db0a5]">
                      {habit.note || "温柔坚持就很棒"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge>{frequencyLabel(habit.frequency)}</Badge>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === 0}
                        aria-label="上移"
                        onClick={() => moveHabit(habit.id, "up")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={index === activeHabits.length - 1}
                        aria-label="下移"
                        onClick={() => moveHabit(habit.id, "down")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setOpenForm(true);
                          setEditing(habit);
                          setFormError(null);
                          setForm({
                            name: habit.name,
                            emoji: habit.emoji,
                            color: habit.color,
                            frequency: habit.frequency,
                            daysOfWeek: habit.daysOfWeek ?? [1, 3, 5],
                            note: habit.note
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          toggleArchiveHabit(habit.id);
                          toast({ message: `已归档「${habit.name}」`, variant: "default" });
                        }}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setPendingDeleteId(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!activeHabits.length && (
              <div className="rounded-3xl border border-dashed border-white/50 p-8 text-center text-sm text-[#789085] dark:text-[#9eb3a8]">
                <Flower2 className="mx-auto mb-2 h-5 w-5" />
                还没有习惯，先种下一颗小小种子吧。
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>已归档 ({archivedHabits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-2xl bg-white/55 px-4 py-3 dark:bg-[#24302b]/75"
              >
                <p className="text-sm text-[#71847a] dark:text-[#9db0a5]">
                  {habit.emoji} {habit.name}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    toggleArchiveHabit(habit.id);
                    toast({ message: `已恢复「${habit.name}」`, variant: "success" });
                  }}
                >
                  取消归档
                </Button>
              </div>
            ))}
            {!archivedHabits.length && (
              <p className="text-sm text-[#80948a] dark:text-[#95aa9f]">暂无归档习惯</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="删除这个习惯？"
        description={
          pendingDeleteName
            ? `「${pendingDeleteName}」及其相关打卡记录将被永久删除，无法恢复。`
            : "该习惯及其打卡记录将被永久删除。"
        }
        confirmLabel="确认删除"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteId) return;
          const name = pendingDeleteName ?? "习惯";
          const snapshot = deleteHabit(pendingDeleteId);
          setPendingDeleteId(null);
          toast({
            message: `已删除「${name}」`,
            variant: "default",
            action: snapshot
              ? {
                  label: "撤销",
                  onClick: () => {
                    restoreHabit(snapshot);
                  }
                }
              : undefined
          });
        }}
      />
    </div>
  );
}
