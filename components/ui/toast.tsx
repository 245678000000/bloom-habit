"use client";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur-xl",
              toast.variant === "error"
                ? "border-[#e8b4a8]/80 bg-[#fff5f2]/95 text-[#8a4a3c] dark:border-[#8a4a3c]/40 dark:bg-[#2f221f]/95 dark:text-[#f0c4b8]"
                : toast.variant === "success"
                  ? "border-[#b3d9c4]/80 bg-[#f3faf6]/95 text-[#355445] dark:border-[#5b8c75]/40 dark:bg-[#1f2c25]/95 dark:text-[#d5e4dc]"
                  : "border-white/50 bg-white/95 text-[#3b4f45] dark:border-white/10 dark:bg-[#24302b]/95 dark:text-[#d5e4dc]"
            )}
          >
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            {toast.action ? (
              <button
                type="button"
                className="shrink-0 rounded-xl bg-[#a8caba]/35 px-3 py-1.5 text-xs font-bold text-[#2f4a3c] dark:bg-[#6f9b86]/35 dark:text-[#e0f0e8]"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="关闭"
              className="shrink-0 text-xs opacity-60 hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
