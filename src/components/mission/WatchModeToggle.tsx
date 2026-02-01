import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Radio, FileCheck, FileSearch } from "lucide-react";

export type WatchMode = "replay" | "live" | "decision" | "evidence";

interface WatchModeToggleProps {
  mode: WatchMode;
  onModeChange: (mode: WatchMode) => void;
  isLive?: boolean;
}

export function WatchModeToggle({ mode, onModeChange, isLive }: WatchModeToggleProps) {
  return (
    <Tabs value={mode} onValueChange={(v) => onModeChange(v as WatchMode)}>
      <TabsList className="grid grid-cols-4 w-full max-w-md">
        <TabsTrigger value="replay" className="gap-1.5 text-xs sm:text-sm">
          <Play className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Replay 30s</span>
          <span className="sm:hidden">Replay</span>
        </TabsTrigger>
        <TabsTrigger value="live" className="gap-1.5 text-xs sm:text-sm">
          <Radio className={`h-3.5 w-3.5 ${isLive ? "text-live animate-pulse" : ""}`} />
          <span className="hidden sm:inline">Live Studio</span>
          <span className="sm:hidden">Live</span>
        </TabsTrigger>
        <TabsTrigger value="decision" className="gap-1.5 text-xs sm:text-sm">
          <FileCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Decision</span>
          <span className="sm:hidden">Decide</span>
        </TabsTrigger>
        <TabsTrigger value="evidence" className="gap-1.5 text-xs sm:text-sm">
          <FileSearch className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Evidence</span>
          <span className="sm:hidden">Evidence</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
