"use client";
import { useIDEState } from '@/lib/ideState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BackendToggle() {
  const { backend, setBackend } = useIDEState();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Storage:</span>
      <Select value={backend} onValueChange={(value) => setBackend(value as "local" | "puter")}>
        <SelectTrigger className="h-7 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="puter" className="text-xs">Cloud (Puter)</SelectItem>
          <SelectItem value="local" className="text-xs">Local</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
