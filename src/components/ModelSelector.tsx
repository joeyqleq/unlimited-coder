"use client";

import { useIDEState } from "@/lib/ideState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated with newer models - could be loaded dynamically from puter.ai.listModels()
const PRESET_MODELS = [
  { id: "gpt-5-nano", label: "GPT-5 Nano (default)" },
  { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-opus-4.1", label: "Claude Opus 4.1" },
  { id: "openai/gpt-4.1", label: "GPT-4.1" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "deepseek/deepseek-v3", label: "DeepSeek V3" },
];

export function ModelSelector() {
  const { modelId, setModelId } = useIDEState();
  return (
    <Select value={modelId} onValueChange={setModelId}>
      <SelectTrigger className="h-7 w-[180px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRESET_MODELS.map((m) => (
          <SelectItem key={m.id} value={m.id} className="text-xs">
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
