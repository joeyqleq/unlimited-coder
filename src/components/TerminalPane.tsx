"use client";

import { useEffect, useRef } from "react";

export function TerminalPane() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let term: any;
    let fitAddon: any;

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

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    })();

    return () => {
      try {
        fitAddon?.dispose?.();
        term?.dispose?.();
      } catch {}
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full bg-neutral-950" />;
}
