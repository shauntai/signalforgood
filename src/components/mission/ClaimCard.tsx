import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

interface ClaimCardProps {
  claimText: string;
  claimType: "evidence" | "precedent" | "assumption" | "speculation";
  confidence: number;
  isFlagged: boolean;
  isRetracted: boolean;
}

const typeConfig = {
  evidence: {
    icon: CheckCircle,
    label: "Evidence",
    className: "bg-evidence-high/10 text-evidence-high border-evidence-high/30",
  },
  precedent: {
    icon: Sparkles,
    label: "Precedent",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  assumption: {
    icon: HelpCircle,
    label: "Assumption",
    className: "bg-evidence-medium/10 text-evidence-medium border-evidence-medium/30",
  },
  speculation: {
    icon: AlertTriangle,
    label: "Speculation",
    className: "bg-evidence-low/10 text-evidence-low border-evidence-low/30",
  },
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return "text-evidence-high";
  if (confidence >= 40) return "text-evidence-medium";
  return "text-evidence-low";
}

export function ClaimCard({
  claimText,
  claimType,
  confidence,
  isFlagged,
  isRetracted,
}: ClaimCardProps) {
  const config = typeConfig[claimType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        config.className,
        isRetracted && "opacity-50 line-through",
        isFlagged && "ring-2 ring-destructive/30"
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {config.label}
            </Badge>
            <span className={cn("text-xs font-medium", getConfidenceColor(confidence))}>
              {confidence}% confident
            </span>
            {isFlagged && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Flagged
              </Badge>
            )}
            {isRetracted && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                Retracted
              </Badge>
            )}
          </div>
          <p className="text-sm">{claimText}</p>
        </div>
      </div>
    </div>
  );
}
