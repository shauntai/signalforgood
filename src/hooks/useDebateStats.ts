import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DebateStat {
  mission_id: string;
  last_message_at: string | null;
  messages_last_hour: number;
  claims_count: number;
  citation_coverage: number;
  updated_at: string;
}

interface MissionWithStats {
  id: string;
  title: string;
  core_question: string | null;
  status: "draft" | "live" | "paused" | "completed";
  is_live: boolean;
  bucket: {
    slug: string;
    name: string;
  };
  stats: DebateStat | null;
}

export function useDebateStats() {
  const [missions, setMissions] = useState<MissionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMissions() {
      try {
        const { data: missionsData, error: missionsError } = await supabase
          .from("missions")
          .select(`
            id,
            title,
            core_question,
            status,
            is_live,
            buckets!inner(slug, name)
          `)
          .in("status", ["live", "completed"])
          .order("is_live", { ascending: false });

        if (missionsError) throw missionsError;

        const { data: statsData, error: statsError } = await supabase
          .from("debate_stats")
          .select("*");

        if (statsError) throw statsError;

        const statsMap = new Map(
          (statsData || []).map((stat) => [stat.mission_id, stat])
        );

        const formatted: MissionWithStats[] = (missionsData || []).map(
          (mission: any) => ({
            id: mission.id,
            title: mission.title,
            core_question: mission.core_question,
            status: mission.status,
            is_live: mission.is_live,
            bucket: {
              slug: mission.buckets?.slug || "education",
              name: mission.buckets?.name || "Education",
            },
            stats: statsMap.get(mission.id) || null,
          })
        );

        setMissions(formatted);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMissions();

    // Subscribe to realtime updates on debate_stats
    const channel = supabase
      .channel("debate_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "debate_stats",
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as DebateStat;
            setMissions((prev) =>
              prev.map((m) =>
                m.id === updated.mission_id ? { ...m, stats: updated } : m
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missions",
        },
        async () => {
          // Refetch on mission changes
          const { data } = await supabase
            .from("missions")
            .select(`
              id,
              title,
              core_question,
              status,
              is_live,
              buckets!inner(slug, name)
            `)
            .in("status", ["live", "completed"]);

          if (data) {
            setMissions((prev) => {
              const statsMap = new Map(
                prev.map((m) => [m.id, m.stats])
              );
              return (data as any[]).map((mission) => ({
                id: mission.id,
                title: mission.title,
                core_question: mission.core_question,
                status: mission.status,
                is_live: mission.is_live,
                bucket: {
                  slug: mission.buckets?.slug || "education",
                  name: mission.buckets?.name || "Education",
                },
                stats: statsMap.get(mission.id) || null,
              }));
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { missions, isLoading, error };
}
