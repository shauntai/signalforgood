import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DebateMessage {
  id: string;
  mission_id: string;
  agent_id: string;
  round_number: number;
  content: string;
  lane: "proposal" | "support" | "counter";
  created_at: string;
  agent?: {
    name: string;
  };
  mission?: {
    title: string;
    bucket_id: string;
    bucket?: {
      slug: string;
    };
  };
}

interface TickerMessage {
  id: string;
  bucket: string;
  agentName: string;
  snippet: string;
  timeAgo: string;
  missionId: string;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

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
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("debate_messages")
          .select(`
            id,
            mission_id,
            content,
            created_at,
            agents!inner(name),
            missions!inner(title, bucket_id, buckets!inner(slug))
          `)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        const formatted: TickerMessage[] = (data || []).map((msg: any) => ({
          id: msg.id,
          bucket: msg.missions?.buckets?.slug || "education",
          agentName: msg.agents?.name || "Agent",
          snippet: truncateContent(msg.content),
          timeAgo: getTimeAgo(msg.created_at),
          missionId: msg.mission_id,
        }));

        setMessages(formatted);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("debate_messages_ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "debate_messages",
        },
        async (payload) => {
          // Fetch the full message with joins
          const { data } = await supabase
            .from("debate_messages")
            .select(`
              id,
              mission_id,
              content,
              created_at,
              agents!inner(name),
              missions!inner(title, bucket_id, buckets!inner(slug))
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const newMessage: TickerMessage = {
              id: data.id,
              bucket: (data as any).missions?.buckets?.slug || "education",
              agentName: (data as any).agents?.name || "Agent",
              snippet: truncateContent(data.content),
              timeAgo: getTimeAgo(data.created_at),
              missionId: data.mission_id,
            };

            setMessages((prev) => [newMessage, ...prev.slice(0, limit - 1)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { messages, isLoading, error };
}
