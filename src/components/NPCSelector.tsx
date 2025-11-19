"use client";

import { useIDEState } from "@/lib/ideState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NPCSelector() {
  const { npcId, npcs, setNPCId } = useIDEState();
  return (
    <Select value={npcId ?? "none"} onValueChange={(value) => setNPCId(value === "none" ? null : value)}>
      <SelectTrigger className="h-7 w-[140px] text-xs">
        <SelectValue placeholder="None" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-xs">None</SelectItem>
        {npcs.map((npc) => (
          <SelectItem key={npc.id} value={npc.id} className="text-xs">
            {npc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
