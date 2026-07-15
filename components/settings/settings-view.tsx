"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, RotateCcw, UserRound, Download, Upload, Bell } from "lucide-react";

import { useHabitStore } from "@/components/providers/habit-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { exportStoreToFile, readStoreFromFile } from "@/lib/storage";

export function SettingsView() {
  const { state, setName, resetAll, hydrated, importStore, setReminder } = useHabitStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [name, setNameInput] = useState(state.displayName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importReady, setImportReady] = useState<{ store: typeof state } | null>(null);
  const [notificationSupport] = useState(
    () => typeof window !== "undefined" && "Notification" in window
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(state.displayName);
  }, [state.displayName]);

  if (!hydrated) {
    return <Card className="h-40 animate-pulse" />;
  }

  const requestNotificationPermission = async () => {
    if (!notificationSupport) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") {
      toast({ message: "通知权限已被拒绝，请在浏览器设置中开启", variant: "error" });
      return false;
    }
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-8 md:space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>个人偏好</CardTitle>
          <CardDescription>让 Bloom Habit 更像你。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#70857a] dark:text-[#9caf9f]">
              <UserRound className="h-4 w-4" /> 称呼
            </label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setNameInput(e.target.value)} placeholder="例如 Windy" />
              <Button
                onClick={() => {
                  setName(name);
                  toast({ message: "称呼已保存", variant: "success" });
                }}
              >
                保存
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[#70857a] dark:text-[#9caf9f]">主题</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={theme === "light" ? "default" : "secondary"} onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" /> 浅色
              </Button>
              <Button variant={theme === "dark" ? "default" : "secondary"} onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" /> 深色
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>每日提醒</CardTitle>
          <CardDescription>
            <span className="font-semibold text-[#8a6a4a] dark:text-[#d4b48a]">
              仅在应用打开或前台运行时生效
            </span>
            ，浏览器无法保证后台准时推送。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!notificationSupport && (
            <p className="text-sm text-[#a07a6a] dark:text-[#d4a898]">当前环境不支持系统通知。</p>
          )}
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/55 px-4 py-3 dark:bg-[#24302b]/75">
            <div className="flex items-center gap-2 text-sm text-[#5f7469] dark:text-[#a8bbae]">
              <Bell className="h-4 w-4" />
              开启提醒
            </div>
            <Button
              size="sm"
              variant={state.reminderEnabled ? "default" : "secondary"}
              disabled={!notificationSupport}
              onClick={async () => {
                if (!state.reminderEnabled) {
                  const ok = await requestNotificationPermission();
                  if (!ok) return;
                  setReminder(true, state.reminderTime);
                  toast({ message: "已开启每日提醒（前台有效）", variant: "success" });
                } else {
                  setReminder(false, state.reminderTime);
                  toast({ message: "已关闭提醒" });
                }
              }}
            >
              {state.reminderEnabled ? "已开启" : "已关闭"}
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#70857a] dark:text-[#9caf9f]">提醒时间</label>
            <Input
              type="time"
              value={state.reminderTime}
              disabled={!notificationSupport}
              onChange={(e) => {
                const time = e.target.value || "20:00";
                setReminder(state.reminderEnabled, time);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>
            导出备份、导入恢复，或重置为默认数据。休息日记录会一并包含在备份中。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                exportStoreToFile(state);
                toast({ message: "备份已下载", variant: "success" });
              }}
            >
              <Download className="h-4 w-4" /> 导出备份
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> 导入备份
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                const result = await readStoreFromFile(file);
                if (!result.ok) {
                  toast({ message: result.error, variant: "error" });
                  setImportReady(null);
                  return;
                }
                setImportReady({ store: result.store });
              }}
            />
          </div>
          <Button variant="destructive" className="w-full" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> 重置全部数据
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="重置全部数据？"
        description="将恢复默认习惯并清空所有打卡与休息日记录。此操作不可撤销，建议先导出备份。"
        confirmLabel="确认重置"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
          toast({ message: "已重置为默认数据", variant: "success" });
        }}
      />

      <ConfirmDialog
        open={Boolean(importReady)}
        title="导入备份并覆盖？"
        description="导入将完全替换当前习惯、打卡与休息日记录。建议先导出一份当前备份。"
        confirmLabel="确认导入"
        destructive
        onCancel={() => setImportReady(null)}
        onConfirm={() => {
          if (importReady) {
            importStore(importReady.store);
            toast({ message: "备份已导入", variant: "success" });
          }
          setImportReady(null);
        }}
      />
    </div>
  );
}
