import { useState, useEffect, useCallback } from "react";
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

  const fetchStatus = useCallback(async () => {
    try {
      // Compute live stats from real tables in parallel
      const [liveMissions, recentMessages, coverageResult, sysRow] = await Promise.all([
        supabase
          .from("missions")
          .select("id", { count: "exact", head: true })
          .eq("status", "live")
          .eq("is_live", true),
        supabase
          .from("debate_messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()),
        supabase
          .from("debate_stats")
          .select("citation_coverage"),
        supabase
          .from("system_status")
          .select("generation_enabled, budget_state, last_updated")
          .limit(1)
          .single(),
      ]);

      const avgCoverage = coverageResult.data?.length
        ? Math.round(
            coverageResult.data.reduce((sum, r) => sum + (r.citation_coverage ?? 0), 0) /
              coverageResult.data.length
          )
        : 0;

      setStatus({
        debates_live: liveMissions.count ?? 0,
        messages_last_10_min: recentMessages.count ?? 0,
        citation_coverage_24h: avgCoverage,
        generation_enabled: sysRow.data?.generation_enabled ?? false,
        budget_state: sysRow.data?.budget_state ?? "unknown",
        last_updated: sysRow.data?.last_updated ?? new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30_000);

    // Subscribe to realtime updates on missions and debate_messages for instant refresh
    const channel = supabase
      .channel("heartbeat_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "missions" },
        () => fetchStatus()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "debate_messages" },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchStatus]);

  return { status, isLoading, error };
}
