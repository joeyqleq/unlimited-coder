"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Theme = "default" | "ocean";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "default", label: "Graphite" },
  { value: "ocean", label: "Ocean" },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("uc-theme")) as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function applyTheme(next: Theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (next === "default") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", next);
    }
  }

  return (
    <div className="flex items-center gap-2 text-[11px] text-neutral-300">
      <Palette className="h-3.5 w-3.5 text-neutral-400" />
      <Select
        value={theme}
        onValueChange={(value) => {
          const next = value as Theme;
          setTheme(next);
          applyTheme(next);
          if (typeof window !== "undefined") {
            localStorage.setItem("uc-theme", next);
          }
        }}
      >
        <SelectTrigger className="h-8 w-[150px] text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
