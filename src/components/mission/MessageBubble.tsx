import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  role: string;
  bias_statement: string | null;
  avatar_url: string | null;
}

interface MessageBubbleProps {
  content: string;
  agent: Agent | null;
  lane: "proposal" | "support" | "counter";
  roundNumber: number;
  createdAt: string;
  isNew?: boolean;
}

const laneColors = {
  proposal: "border-l-primary",
  support: "border-l-evidence-high",
  counter: "border-l-evidence-low",
};

const laneLabels = {
  proposal: "Proposal",
  support: "Supporting",
  counter: "Counter",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({
  content,
  agent,
  lane,
  roundNumber,
  createdAt,
  isNew,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "relative p-4 bg-card rounded-lg border-l-4 transition-all",
        laneColors[lane],
        isNew && "animate-fade-in ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-muted">
            {agent ? getInitials(agent.name) : "AI"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {agent?.name || "Agent"}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {laneLabels[lane]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Round {roundNumber}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(createdAt)}
            </span>
          </div>

          {agent?.role && (
            <p className="text-xs text-muted-foreground mb-2 italic">
              {agent.role}
            </p>
          )}

          <div className="text-sm text-foreground whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
