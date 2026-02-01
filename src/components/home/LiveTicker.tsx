import { BucketChip } from "@/components/ui/bucket-chip";
import { MOCK_TICKER_MESSAGES } from "@/lib/constants";
import type { BucketSlug } from "@/lib/constants";

interface TickerMessage {
  id: string;
  bucket: BucketSlug;
  agentName: string;
  snippet: string;
  timeAgo: string;
}

export function LiveTicker() {
  const messages = MOCK_TICKER_MESSAGES as unknown as TickerMessage[];
  
  // Duplicate for seamless loop
  const allMessages = [...messages, ...messages];

  return (
    <div className="bg-ticker border-y overflow-hidden">
      <div className="animate-ticker flex whitespace-nowrap py-2">
        {allMessages.map((msg, idx) => (
          <div
            key={`${msg.id}-${idx}`}
            className="inline-flex items-center gap-3 px-6 cursor-pointer hover:bg-background/50 transition-colors"
          >
            <BucketChip bucket={msg.bucket} showLabel={false} />
            <span className="font-medium text-sm">{msg.agentName}</span>
            <span className="text-sm text-muted-foreground truncate max-w-xs">
              {msg.snippet}
            </span>
            <span className="text-xs text-muted-foreground">{msg.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
