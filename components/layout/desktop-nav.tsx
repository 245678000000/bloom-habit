"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2 } from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/40 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#1a211c]/88 md:block">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dff0e7] to-[#fbe8d6] text-[#3b574b] shadow-soft dark:from-[#33463d] dark:to-[#4d3b32] dark:text-[#d7e7de]">
            <Flower2 className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-[#3b4f45] dark:text-[#d5e4dc]">
              Bloom Habit
            </p>
            <p className="text-[11px] text-[#7a8f84] dark:text-[#9eb2a8]">绽放习惯</p>
          </div>
        </Link>

        <nav aria-label="主导航">
          <ul className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/55 p-1 dark:border-white/10 dark:bg-[#24302b]/70">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-br from-[#dff0e7] to-[#fbe8d6] text-[#3b574b] shadow-soft dark:from-[#33463d] dark:to-[#4d3b32] dark:text-[#d7e7de]"
                        : "text-[#6f8379] hover:bg-white/80 dark:text-[#9bb0a5] dark:hover:bg-white/5"
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
      </div>
    </header>
  );
}
