import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bloom-bg relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_68%)] md:h-[360px]" />
      <DesktopNav />
      <main className="relative pb-28 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:max-w-5xl lg:max-w-6xl lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
