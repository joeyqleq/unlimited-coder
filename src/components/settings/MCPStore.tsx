"use client";

import { useIDEState } from "@/lib/ideState";

type StoreItem = {
  id: string;
  name: string;
  transport: "http" | "sse" | "stdio";
  scope: "local" | "remote";
  url?: string;
  command?: string;
  description: string;
  tags: string[];
};

const curated: StoreItem[] = [
  {
    id: "playwright-mcp",
    name: "Playwright MCP (local)",
    transport: "http",
    scope: "local",
    url: "http://127.0.0.1:3939/mcp",
    description: "Drive Chromium, click, type, and take screenshots for visual debugging.",
    tags: ["browser", "screenshots", "automation"],
  },
  {
    id: "shadcn-mcp",
    name: "shadcn UI MCP",
    transport: "http",
    scope: "remote",
    url: "https://shadcn-mcp.fly.dev/mcp",
    description: "Generate, install, and manage shadcn/ui components.",
    tags: ["ui", "components"],
  },
  {
    id: "magicui-mcp",
    name: "@magicuidesign/mcp",
    transport: "http",
    scope: "remote",
    url: "https://magicui-mcp.fly.dev/mcp",
    description: "Library of interactive MagicUI components/snippets.",
    tags: ["ui", "snippets"],
  },
  {
    id: "serena-stdio",
    name: "Serena (stdio)",
    transport: "stdio",
    scope: "local",
    command: "uv run serena start-mcp-server",
    description: "Local stdio MCP server for structured tool use.",
    tags: ["stdio", "local"],
  },
];

export function MCPStore() {
  const { npcServers, addNPCServer } = useIDEState();

  const onInstall = (item: StoreItem) => {
    const exists = npcServers.some((s) => s.id === item.id);
    if (exists) return;
    addNPCServer({
      id: item.id,
      name: item.name,
      url: item.url ?? "",
      transport: item.transport,
      scope: item.scope,
      command: item.command,
      notes: item.description,
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {curated.map((item) => {
        const installed = npcServers.some((s) => s.id === item.id);
        return (
          <div
            key={item.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item.name}</span>
                <span className="text-[11px] text-neutral-400">
                  {item.transport.toUpperCase()} · {item.scope === "local" ? "Local" : "Remote"}
                </span>
              </div>
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  installed
                    ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40 cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                disabled={installed}
                onClick={() => onInstall(item)}
              >
                {installed ? "Installed" : "Add"}
              </button>
            </div>
            <p className="text-sm text-neutral-200">{item.description}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-neutral-300 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            {item.url && (
              <div className="text-[11px] text-neutral-400 truncate">Endpoint: {item.url}</div>
            )}
            {item.command && (
              <div className="text-[11px] text-neutral-400 truncate">Command: {item.command}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
