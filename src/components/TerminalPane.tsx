"use client";

import { useEffect, useRef } from "react";

export function TerminalPane() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let term: any;
    let fitAddon: any;
    let removeMessageListener: (() => void) | null = null;

    (async () => {
      if (!containerRef.current) return;
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      await import("xterm/css/xterm.css");

      term = new Terminal({
        fontSize: 12,
        theme: { background: "#050509" },
      });
      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      term.writeln("🚀 Web terminal is ready (stub). Wire this to serverless workers, build logs, etc.");
      term.write("> ");

      const handleResize = () => fitAddon?.fit?.();
      window.addEventListener("resize", handleResize);
      const handleTerminalMessage = (event: Event) => {
        const detail = (event as CustomEvent<{ text?: string; clear?: boolean }>).detail;
        if (!detail || !term) return;
        if (detail.clear) {
          term.clear();
          term.write("> ");
          return;
        }
        if (detail.text) {
          term.writeln(detail.text);
          term.write("> ");
        }
      };
      window.addEventListener("ide:terminal-message", handleTerminalMessage as EventListener);
      removeMessageListener = () =>
        window.removeEventListener("ide:terminal-message", handleTerminalMessage as EventListener);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    })();

    return () => {
      try {
        removeMessageListener?.();
        fitAddon?.dispose?.();
        term?.dispose?.();
      } catch {}
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full bg-neutral-950" />;
}
