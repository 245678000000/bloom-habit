"use client";

import { HabitProvider } from "@/components/providers/habit-provider";
import { ReminderWatcher } from "@/components/providers/reminder-provider";
import { ServiceWorkerRegister } from "@/components/providers/sw-register";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HabitProvider>
          <ServiceWorkerRegister />
          <ReminderWatcher />
          {children}
        </HabitProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
