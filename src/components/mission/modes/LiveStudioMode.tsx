import { useEffect, useRef } from "react";
import { MessageBubble } from "../MessageBubble";
import { LivePill } from "@/components/ui/live-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Agent {
  id: string;
  name: string;
  role: string;
  bias_statement: string | null;
  avatar_url: string | null;
}

interface DebateMessage {
  id: string;
  agent_id: string;
  round_number: number;
  content: string;
  lane: "proposal" | "support" | "counter";
  created_at: string;
  agent: Agent | null;
}

interface LiveStudioModeProps {
  messages: DebateMessage[];
  isLive: boolean;
  isLoading?: boolean;
}

export function LiveStudioMode({ messages, isLive, isLoading }: LiveStudioModeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string | null>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const latestId = messages[messages.length - 1].id;
      if (latestId !== lastMessageId.current) {
        lastMessageId.current = latestId;
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // Group messages by round
  const messagesByRound = messages.reduce((acc, msg) => {
    const round = msg.round_number;
    if (!acc[round]) acc[round] = [];
    acc[round].push(msg);
    return acc;
  }, {} as Record<number, DebateMessage[]>);

  const rounds = Object.keys(messagesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-card rounded-lg border space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {isLive
            ? "Waiting for debate to begin..."
            : "No messages in this debate yet."}
        </p>
        {isLive && (
          <div className="mt-4 flex justify-center">
            <LivePill />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLive && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LivePill />
          <span>Debate is live • Messages appear in real-time</span>
        </div>
      )}

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {rounds.map((round) => (
            <div key={round}>
              <div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-3 z-10">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Round {round}
                </h3>
              </div>
              <div className="space-y-3">
                {messagesByRound[round].map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    content={msg.content}
                    agent={msg.agent}
                    lane={msg.lane}
                    roundNumber={msg.round_number}
                    createdAt={msg.created_at}
                    isNew={
                      idx === messagesByRound[round].length - 1 &&
                      round === rounds[rounds.length - 1]
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
