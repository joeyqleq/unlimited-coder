"use client";
import { useEffect, useState } from 'react';
import { getPuter } from '@/lib/puterClient';
import { useIDEState } from '@/lib/ideState';
import { getSummary } from '@/lib/fsClient';

export function SummaryView() {
  const { projectRoot } = useIDEState();
  const [paths, setPaths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [filter, setFilter] = useState('');
  useEffect(() => {
    (async () => {
      const puter = getPuter();
      if (!puter) return;
      const list: string[] = await puter.kv.list('summary:');
      const relPaths = list
        .map((k: any) => k.replace(/^summary:/, ''))
        .filter((p: string) => p.startsWith(projectRoot));
      setPaths(relPaths);
    })();
  }, [projectRoot]);
  async function onSelect(path: string) {
    setSelected(path);
    const summary = await getSummary(path);
    setContent(summary ?? 'No summary available');
  }
  const filtered = paths.filter((p) => p.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="flex h-full">
      <div className="w-48 border-r border-neutral-800 flex flex-col">
        <input
          className="m-2 p-1 text-xs bg-neutral-900 border border-neutral-700"
          placeholder="Filter summaries..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex-1 overflow-auto text-xs">
          {filtered.map((p) => (
            <button
              key={p}
              className={`block w-full text-left px-2 py-1 hover:bg-neutral-800 ${selected === p ? 'bg-neutral-800' : ''}`}
              onClick={() => onSelect(p)}
            >
              {p.replace(projectRoot + '/', '')}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-2 overflow-auto text-xs">
        {selected ? (
          <pre className="whitespace-pre-wrap font-mono">{content}</pre>
        ) : (
          <p className="text-neutral-500">Select a summary to view its content.</p>
        )}
      </div>
    </div>
  );
}
