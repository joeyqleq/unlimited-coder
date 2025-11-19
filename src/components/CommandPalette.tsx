"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface CommandPaletteCommand {
  id: string;
  label: string;
  description?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandPaletteCommand[];
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [commands, query]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1424] shadow-2xl">
        <input
          className="w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-500">No matching commands.</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition",
                )}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
              >
                <div className="font-medium">{cmd.label}</div>
                {cmd.description && <div className="text-xs text-neutral-500">{cmd.description}</div>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
