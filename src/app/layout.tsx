import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata = {
  title: "Unlimited Coder",
  description: "Browser IDE powered by multi-LLM Puter.js backend",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Puter.js – gives you puter.ai, puter.fs, puter.kv, etc. */}
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
        />
      </head>
      <body className="h-full">
        <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_10%_0%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.1),transparent_20%),hsl(var(--background))] text-neutral-100">
          <header className="sticky top-0 z-30 h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[rgba(10,14,22,0.8)] backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 text-[11px]">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
                Live Dev Server
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight">Unlimited Coder</span>
                <span className="text-[11px] text-neutral-400">Multi-LLM workspace powered by Puter.js</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-neutral-400 text-[11px]">
              <span className="uppercase tracking-[0.08em] text-neutral-500">Design mode</span>
              <span className="px-2 py-1 rounded-md border border-white/5 bg-white/5">VS Code-inspired UI</span>
            </div>
          </header>
          <main className="flex-1 flex overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
