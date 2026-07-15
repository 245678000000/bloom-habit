"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookHeart, BarChart3, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/habits", label: "习惯库", icon: BookHeart },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings2 }
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 z-40 w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl border border-white/40 bg-white/82 p-2 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-[#1f2722]/85">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-xs transition",
                  active
                    ? "bg-gradient-to-br from-[#dff0e7] to-[#fbe8d6] text-[#3b574b] dark:from-[#33463d] dark:to-[#4d3b32] dark:text-[#d7e7de]"
                    : "text-[#6f8379] hover:bg-white/60 dark:text-[#9bb0a5] dark:hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "scale-110")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
