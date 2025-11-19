"use client";

import { useEffect, useState } from "react";
import { Radio, WifiOff } from "lucide-react";
import { getPuter } from "@/lib/puterClient";
import { cn } from "@/lib/utils";

type Status = "checking" | "ready" | "missing";

export function PuterIndicator() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let attempts = 0;
    const tick = () => {
      attempts += 1;
      const ready = !!getPuter();
      if (ready) {
        setStatus("ready");
        return;
      }
      if (attempts > 8) {
        setStatus("missing");
      }
    };

    tick();
    const id = setInterval(tick, 600);
    return () => clearInterval(id);
  }, []);

  const label =
    status === "ready"
      ? "Puter connected"
      : status === "checking"
      ? "Waiting for Puter.js…"
      : "Puter.js not loaded";

  const hint =
    status === "ready"
      ? "Cloud FS, KV, and AI are available."
      : "Ensure https://js.puter.com/v2/ loads (VPN/adblock?) then refresh.";

  async function reloadScript() {
    const existing = document.querySelector('script[src="https://js.puter.com/v2/"]') as HTMLScriptElement | null;
    if (existing) existing.remove();
    const tag = document.createElement("script");
    tag.src = "https://js.puter.com/v2/";
    tag.defer = true;
    document.head.appendChild(tag);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs shadow-sm",
        status === "ready"
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
          : "border-amber-400/50 bg-amber-400/10 text-amber-50"
      )}
    >
      {status === "ready" ? (
        <Radio className="h-4 w-4 text-emerald-300" />
      ) : (
        <WifiOff className="h-4 w-4 text-amber-300" />
      )}
      <div className="flex flex-col leading-tight">
        <span className="font-semibold">{label}</span>
        <span className="text-[11px] text-white/70">{hint}</span>
        {status !== "ready" && (
          <button
            className="mt-1 text-[11px] text-primary hover:underline"
            onClick={reloadScript}
          >
            Reload Puter.js
          </button>
        )}
      </div>
    </div>
  );
}
