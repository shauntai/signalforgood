import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SystemStatus {
  debates_live: number;
  messages_last_10_min: number;
  citation_coverage_24h: number;
  generation_enabled: boolean;
  budget_state: string;
  last_updated: string;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const { data, error } = await supabase
          .from("system_status")
          .select("*")
          .limit(1)
          .single();

        if (error) throw error;
        setStatus(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();

    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30_000);

    // Subscribe to realtime updates
    const channel = supabase
      .channel("system_status_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "system_status",
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new as SystemStatus);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { status, isLoading, error };
}
