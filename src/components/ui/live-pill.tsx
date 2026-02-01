import { cn } from "@/lib/utils";

interface LivePillProps {
  className?: string;
}

export function LivePill({ className }: LivePillProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-0.5 text-xs font-semibold text-live",
      className
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
      LIVE
    </div>
  );
}
