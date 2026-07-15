import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Bloom Habit | 绽放习惯",
  description: "让每一天都悄悄开花",
  applicationName: "Bloom Habit",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bloom Habit"
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg" }]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#151b17" }
  ],
  width: "device-width",
  initialScale: 1
};

const themeInitScript = `
(function(){
  try {
    var key = 'bloom-habit-theme';
    var saved = localStorage.getItem(key);
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-rounded">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
