"use client";
import { useIDEState } from '@/lib/ideState';
import { useState } from 'react';

export function ProviderManager() {
  const { providers, addProvider } = useIDEState();
  const [form, setForm] = useState({ id: '', label: '', apiKey: '', url: '' });

  const handleAdd = () => {
    if (!form.id || !form.apiKey) return;
    addProvider(form as any);
    setForm({ id: '', label: '', apiKey: '', url: '' });
  };

  return (
    <div className="p-4 text-sm space-y-2">
      <h2 className="font-bold">Manage Providers</h2>
      <div className="space-y-1">
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="ID (e.g. openrouter)"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="Label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="API Key"
          value={form.apiKey}
          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="Custom URL (optional)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <button className="px-2 py-1 bg-blue-600 rounded" onClick={handleAdd}>
          Add Provider
        </button>
      </div>
      <div className="space-y-1 pt-4">
        {providers.map((p) => (
          <div key={p.id} className="border border-neutral-700 p-2 rounded">
            <span className="font-bold">{p.label || p.id}</span>
            <div className="text-xs text-neutral-500 truncate">{p.apiKey}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
