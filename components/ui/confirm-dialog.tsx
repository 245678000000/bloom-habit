"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="关闭对话框"
            className="absolute inset-0 bg-[#1a221e]/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={description ? "confirm-dialog-desc" : undefined}
            className={cn(
              "relative z-10 w-full max-w-sm rounded-3xl border border-white/50 bg-white/95 p-5 shadow-soft",
              "dark:border-white/10 dark:bg-[#24302b]/95"
            )}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-[#3b4f45] dark:text-[#d5e4dc]">
              {title}
            </h2>
            {description ? (
              <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-[#70857a] dark:text-[#9caf9f]">
                {description}
              </p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                ref={confirmRef}
                variant={destructive ? "destructive" : "default"}
                className="flex-1"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
