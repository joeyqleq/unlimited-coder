"use client";

import { create } from "zustand";

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface NPCConfig {
  id: string;
  name: string;
  description: string;
  persona: string;
  systemPrompt: string;
}

export interface ProviderConfig {
  id: string;
  label: string;
  apiKey: string;
  url?: string;
}

export type MCPTransport = "stdio" | "http" | "sse";

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  transport: MCPTransport;
  scope: "local" | "remote";
  command?: string;
  notes?: string;
}

export interface IDEState {
  // Filesystem
  backend: "local" | "puter";
  projectRoot: string;
  currentFile: string | null;
  files: { path: string; isDirectory: boolean }[];
  editorContent: string;
  // Chat and model
  modelId: string;
  chat: ChatMessage[];
  // NPCs
  npcId: string | null;
  npcs: NPCConfig[];
  // Providers
  providers: ProviderConfig[];
  providerId: string | null;
  // MCP servers
  npcServers: MCPServer[];
  npcServerId: string | null;
  // Actions
  setBackend: (backend: "local" | "puter") => void;
  setProjectRoot: (root: string) => void;
  setFiles: (files: { path: string; isDirectory: boolean }[]) => void;
  setCurrentFile: (path: string | null) => void;
  setEditorContent: (content: string) => void;
  setModelId: (modelId: string) => void;
  appendChat: (msg: ChatMessage) => void;
  replaceChat: (msgs: ChatMessage[]) => void;
  setNPCId: (id: string | null) => void;
  addNPC: (npc: NPCConfig) => void;
  deleteNPC: (id: string) => void;
  addProvider: (provider: ProviderConfig) => void;
  setProviderId: (id: string | null) => void;
  addNPCServer: (server: MCPServer) => void;
  setNPCServerId: (id: string | null) => void;
}

export const useIDEState = create<IDEState>((set) => ({
  backend: "puter",
  projectRoot: "./",
  currentFile: null,
  files: [],
  editorContent: "",
  modelId: "gpt-5-nano",
  chat: [],
  npcId: null,
  npcs: [
    {
      id: "architect",
      name: "Architect",
      description: "High-level app designer who plans folder structure and components.",
      persona: "Thinks in systems, loves clean architecture and type safety.",
      systemPrompt:
        "You are an expert software architect and senior React/Next.js engineer. " +
        "You design project structures, components, and stepwise implementation plans.",
    },
    {
      id: "pixelmancer",
      name: "PixelMancer",
      description: "Obsessed with aesthetic UI, motion, and micro-interactions.",
      persona: "Design-focused, loves Tailwind, Framer Motion, and animated components.",
      systemPrompt:
        "You are a world-class UI engineer. You focus on layout, visual hierarchy, " +
        "animation, and accessibility. You use Tailwind and Framer Motion heavily.",
    },
  ],
  providers: [],
  providerId: null,
  npcServers: [
    {
      id: "playwright-local",
      name: "Playwright MCP",
      url: "http://127.0.0.1:3939/mcp",
      transport: "http",
      scope: "local",
      notes: "Local browser automation",
    },
  ],
  npcServerId: null,
  setBackend: (backend) => set({ backend }),
  setProjectRoot: (root) => set({ projectRoot: root }),
  setFiles: (files) => set({ files }),
  setCurrentFile: (path) => set({ currentFile: path ?? null }),
  setEditorContent: (content) => set({ editorContent: content }),
  setModelId: (modelId) => set({ modelId }),
  appendChat: (msg) => set((state) => ({ chat: [...state.chat, msg] })),
  replaceChat: (msgs) => set({ chat: msgs }),
  setNPCId: (id) => set({ npcId: id }),
  addNPC: (npc) => set((state) => ({ npcs: [...state.npcs, npc] })),
  deleteNPC: (id) => set((state) => ({ npcs: state.npcs.filter((npc) => npc.id !== id) })),
  addProvider: (provider) => set((state) => ({ providers: [...state.providers, provider] })),
  setProviderId: (id) => set({ providerId: id }),
  addNPCServer: (server) =>
    set((state) => {
      const exists = state.npcServers.some((s) => s.id === server.id);
      return { npcServers: exists ? state.npcServers : [...state.npcServers, server] };
    }),
  setNPCServerId: (id) => set({ npcServerId: id }),
}));
