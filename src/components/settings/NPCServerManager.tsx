"use client";
import { useIDEState } from '@/lib/ideState';
import { useState } from 'react';

export function NPCServerManager() {
  const { npcServers, addNPCServer } = useIDEState();
  const [form, setForm] = useState({
    id: '',
    name: '',
    url: '',
    transport: 'http' as 'http' | 'stdio' | 'sse',
    scope: 'local' as 'local' | 'remote',
    command: '',
    notes: '',
  });

  const handleAdd = () => {
    if (!form.id || (!form.url && form.transport !== 'stdio')) return;
    addNPCServer({
      id: form.id.trim(),
      name: form.name.trim() || form.id.trim(),
      url: form.url.trim(),
      transport: form.transport,
      scope: form.scope,
      command: form.command.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setForm({ id: '', name: '', url: '', transport: 'http', scope: 'local', command: '', notes: '' });
  };
  return (
    <div className="p-4 text-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Custom MCP servers</h2>
        <p className="text-xs text-neutral-400">
          Register any MCP endpoint (HTTP/SSE) or stdio command. Works for local and remote servers.
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="id (e.g. my-server)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
          <input
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Display name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Endpoint URL (http/https) — omit for stdio"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
            value={form.transport}
            onChange={(e) => setForm({ ...form, transport: e.target.value as any })}
          >
            <option value="http">HTTP</option>
            <option value="sse">SSE</option>
            <option value="stdio">STDIO (local command)</option>
          </select>
          <select
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value as any })}
          >
            <option value="local">Local</option>
            <option value="remote">Remote</option>
          </select>
          <input
            className="col-span-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Command (if stdio)"
            value={form.command}
            onChange={(e) => setForm({ ...form, command: e.target.value })}
          />
        </div>
        <textarea
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Notes (what tools are provided, auth info, etc.)"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Supports HTTP, SSE, and stdio targets.</span>
          <button
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
            onClick={handleAdd}
          >
            Add server
          </button>
        </div>
      </div>
      <div className="pt-1 space-y-2">
        {npcServers.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 bg-black/20 px-3 py-2 text-neutral-400 text-xs">
            No servers yet. Add one above to enable tool-calling beyond Puter.
          </div>
        )}
        {npcServers.map((srv) => (
          <div key={srv.id} className="border border-white/10 bg-white/5 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{srv.name || srv.id}</span>
                <span className="text-[11px] text-neutral-400">({srv.transport.toUpperCase()}, {srv.scope})</span>
              </div>
              <span className="text-[11px] text-neutral-400">id: {srv.id}</span>
            </div>
            <div className="text-xs text-neutral-300 truncate">{srv.url || srv.command}</div>
            {srv.notes && <div className="text-[11px] text-neutral-400 mt-1">{srv.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
