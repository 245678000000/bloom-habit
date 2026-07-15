import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bloom-bg relative min-h-screen pb-32 pt-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_68%)]" />
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">{children}</div>
      <BottomNav />
    </main>
  );
}
