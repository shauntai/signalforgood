import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useDebateStats } from "@/hooks/useDebateStats";
import { BucketChip } from "@/components/ui/bucket-chip";
import type { BucketSlug } from "@/lib/constants";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { missions } = useDebateStats();
  const [query, setQuery] = useState("");

  const filtered = query.length > 0
    ? missions.filter((m) => {
        const q = query.toLowerCase();
        return m.title.toLowerCase().includes(q) || (m.core_question?.toLowerCase().includes(q) ?? false);
      })
    : missions.slice(0, 8);

  const select = useCallback((id: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/missions/${id}`);
  }, [navigate, onOpenChange]);

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search missions..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No missions found.</CommandEmpty>
        <CommandGroup heading="Missions">
          {filtered.map((m) => (
            <CommandItem key={m.id} value={m.title} onSelect={() => select(m.id)} className="cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <BucketChip bucket={m.bucket.slug as BucketSlug} showLabel={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  {m.core_question && <p className="text-xs text-muted-foreground truncate">{m.core_question}</p>}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
