import { Link } from "react-router-dom";
import { BucketChip } from "@/components/ui/bucket-chip";
import { useRecentMessages } from "@/hooks/useRecentMessages";
import { Skeleton } from "@/components/ui/skeleton";
import type { BucketSlug } from "@/lib/constants";

export function LiveTicker() {
  const { messages, isLoading } = useRecentMessages(10);

  // Duplicate for seamless loop
  const allMessages = [...messages, ...messages];

  if (isLoading) {
    return (
      <div className="bg-ticker border-y overflow-hidden">
        <div className="flex items-center gap-6 py-2 px-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-ticker border-y py-2 text-center text-sm text-muted-foreground">
        No recent messages. Check back soon.
      </div>
    );
  }

  return (
    <div className="bg-ticker border-y overflow-hidden">
      <div className="animate-ticker flex whitespace-nowrap py-2">
        {allMessages.map((msg, idx) => (
          <Link
            key={`${msg.id}-${idx}`}
            to={`/missions/${msg.missionId}`}
            className="inline-flex items-center gap-3 px-6 cursor-pointer hover:bg-background/50 transition-colors"
          >
            <BucketChip bucket={msg.bucket as BucketSlug} showLabel={false} />
            <span className="font-medium text-sm">{msg.agentName}</span>
            <span className="text-sm text-muted-foreground truncate max-w-xs">
              {msg.snippet}
            </span>
            <span className="text-xs text-muted-foreground">{msg.timeAgo}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
