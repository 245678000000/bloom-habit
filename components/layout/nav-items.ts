import { Home, BookHeart, BarChart3, Settings2, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: "/" | "/habits" | "/stats" | "/settings";
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/habits", label: "习惯库", icon: BookHeart },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings2 }
] as const;
