"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  className?: string;
}

export function ProgressRing({ value, className }: ProgressRingProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  const angle = safeValue * 3.6;

  return (
    <div
      className={cn(
        "relative mx-auto flex h-44 w-44 items-center justify-center rounded-full p-3 shadow-soft sm:h-52 sm:w-52 lg:h-56 lg:w-56",
        className
      )}
      style={{
        background: `conic-gradient(from -90deg, #86b89f 0deg, #a8caba ${angle * 0.65}deg, #f4c6a0 ${angle}deg, rgba(255,255,255,0.25) ${angle}deg 360deg)`
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
        className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#f8f5ee]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:bg-[#1e2621]/92"
      >
        <span className="text-5xl font-black text-[#3f5d50] dark:text-[#d2e4da]">{Math.round(safeValue)}%</span>
        <span className="mt-1 text-sm text-[#6f8379] dark:text-[#a3b7ad]">今日进度</span>
      </motion.div>
    </div>
  );
}
