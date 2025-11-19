"use client";
import { useIDEState } from '@/lib/ideState';
import { useState } from 'react';

export function NPCManager() {
  const { npcs, addNPC, deleteNPC } = useIDEState();
  const [form, setForm] = useState({ 
    id: '', 
    name: '', 
    description: '', 
    persona: '', 
    systemPrompt: '' 
  });

  const handleAdd = () => {
    if (!form.id || !form.name || !form.systemPrompt) return;
    addNPC(form);
    setForm({ id: '', name: '', description: '', persona: '', systemPrompt: '' });
  };

  return (
    <div className="p-4 text-sm space-y-2">
      <h2 className="font-bold">Manage NPCs</h2>
      <div className="space-y-1">
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="ID (e.g. architect)"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="Persona"
          value={form.persona}
          onChange={(e) => setForm({ ...form, persona: e.target.value })}
        />
        <textarea
          className="w-full border border-neutral-700 p-1 bg-neutral-900"
          placeholder="System Prompt"
          rows={3}
          value={form.systemPrompt}
          onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
        />
        <button className="px-2 py-1 bg-green-600 rounded" onClick={handleAdd}>
          Add NPC
        </button>
      </div>
      <div className="space-y-1 pt-4">
        {npcs.map((npc) => (
          <div key={npc.id} className="border border-neutral-700 p-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold">{npc.name}</span>
                {npc.description && (
                  <div className="text-xs text-neutral-500">{npc.description}</div>
                )}
              </div>
              <button
                className="px-2 py-0.5 bg-red-600 rounded text-xs"
                onClick={() => deleteNPC(npc.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

