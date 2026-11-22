import { useMemo } from "react";
import { useNow } from "./useNow";
import { getStaticRecentMessages } from "@/data/staticData";

interface TickerMessage {
  id: string;
  bucket: string;
  agentName: string;
  snippet: string;
  timeAgo: string;
  missionId: string;
}

function getTimeAgo(dateString: string, now: number): string {
  const diffMins = Math.floor((now - new Date(dateString).getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function truncateContent(content: string, maxWords: number = 10): string {
  const words = content.split(/\s+/);
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(" ") + "...";
}

export function useRecentMessages(limit: number = 10) {
  const now = useNow();
  const messages: TickerMessage[] = useMemo(
    () =>
      getStaticRecentMessages(limit, now).map((m) => ({
        id: m.id,
        bucket: m.slug,
        agentName: m.agent.name,
        snippet: truncateContent(m.content),
        timeAgo: getTimeAgo(m.created_at, now),
        missionId: m.mission_id,
      })),
    [limit, now]
  );
  return { messages, isLoading: false, error: null as Error | null };
}
