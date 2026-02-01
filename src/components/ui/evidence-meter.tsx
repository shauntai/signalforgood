import { cn } from "@/lib/utils";

interface EvidenceMeterProps {
  score: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function EvidenceMeter({ score, size = 'sm', showLabel = false, className }: EvidenceMeterProps) {
  const getColorClass = (score: number) => {
    if (score >= 70) return 'bg-evidence-high';
    if (score >= 40) return 'bg-evidence-medium';
    return 'bg-evidence-low';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "relative rounded-full bg-muted overflow-hidden",
        size === 'sm' ? "h-1.5 w-16" : "h-2 w-24"
      )}>
        <div 
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", getColorClass(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "font-medium tabular-nums",
          size === 'sm' ? "text-xs text-muted-foreground" : "text-sm"
        )}>
          {score}%
        </span>
      )}
    </div>
  );
}
