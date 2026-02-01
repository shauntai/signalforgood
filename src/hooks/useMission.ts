import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface Claim {
  id: string;
  message_id: string;
  claim_text: string;
  claim_type: "evidence" | "precedent" | "assumption" | "speculation";
  confidence: number;
  is_flagged: boolean;
  is_retracted: boolean;
  created_at: string;
}

interface Score {
  evidence_score: number;
  actionability_score: number;
  risk_score: number;
  clarity_score: number;
  overall_score: number;
  citation_coverage: number;
  flagged_claim_rate: number;
  revision_count: number;
}

interface SolutionCard {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  intended_owner: string | null;
  timeline: string | null;
  cost_band: string | null;
  staffing_assumptions: string | null;
  dependencies: string | null;
  risks_mitigations: string | null;
  success_metrics: any[];
  is_published: boolean;
}

interface Replay {
  id: string;
  script: string | null;
  duration_seconds: number;
  timestamp_jumps: any[];
}

interface Mission {
  id: string;
  title: string;
  core_question: string | null;
  constraints: string[];
  success_metric: string | null;
  debate_hook: string | null;
  status: "draft" | "live" | "paused" | "completed";
  is_live: boolean;
  started_at: string | null;
  completed_at: string | null;
  bucket: {
    id: string;
    slug: string;
    name: string;
    color: string;
  };
  messages: DebateMessage[];
  claims: Claim[];
  score: Score | null;
  solution: SolutionCard | null;
  replay: Replay | null;
}

export function useMission(missionId: string | undefined) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!missionId) {
      setIsLoading(false);
      return;
    }

    async function fetchMission() {
      try {
        // Fetch mission with bucket
        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select(`
            *,
            buckets!inner(id, slug, name, color)
          `)
          .eq("id", missionId)
          .single();

        if (missionError) throw missionError;

        // Fetch messages with agents
        const { data: messagesData, error: messagesError } = await supabase
          .from("debate_messages")
          .select(`
            *,
            agents!inner(id, name, role, bias_statement, avatar_url)
          `)
          .eq("mission_id", missionId)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch claims
        const { data: claimsData, error: claimsError } = await supabase
          .from("claims")
          .select("*")
          .eq("mission_id", missionId)
          .order("created_at", { ascending: true });

        if (claimsError) throw claimsError;

        // Fetch score
        const { data: scoreData } = await supabase
          .from("scores")
          .select("*")
          .eq("mission_id", missionId)
          .single();

        // Fetch solution
        const { data: solutionData } = await supabase
          .from("solution_cards")
          .select("*")
          .eq("mission_id", missionId)
          .eq("is_published", true)
          .single();

        // Fetch replay
        const { data: replayData } = await supabase
          .from("replays")
          .select("*")
          .eq("mission_id", missionId)
          .single();

        const formatted: Mission = {
          id: missionData.id,
          title: missionData.title,
          core_question: missionData.core_question,
          constraints: Array.isArray(missionData.constraints) ? missionData.constraints as string[] : [],
          success_metric: missionData.success_metric,
          debate_hook: missionData.debate_hook,
          status: missionData.status,
          is_live: missionData.is_live,
          started_at: missionData.started_at,
          completed_at: missionData.completed_at,
          bucket: {
            id: (missionData as any).buckets.id,
            slug: (missionData as any).buckets.slug,
            name: (missionData as any).buckets.name,
            color: (missionData as any).buckets.color,
          },
          messages: (messagesData || []).map((msg: any) => ({
            id: msg.id,
            agent_id: msg.agent_id,
            round_number: msg.round_number,
            content: msg.content,
            lane: msg.lane,
            created_at: msg.created_at,
            agent: msg.agents
              ? {
                  id: msg.agents.id,
                  name: msg.agents.name,
                  role: msg.agents.role,
                  bias_statement: msg.agents.bias_statement,
                  avatar_url: msg.agents.avatar_url,
                }
              : null,
          })),
          claims: claimsData || [],
          score: scoreData
            ? {
                evidence_score: scoreData.evidence_score || 0,
                actionability_score: scoreData.actionability_score || 0,
                risk_score: scoreData.risk_score || 0,
                clarity_score: scoreData.clarity_score || 0,
                overall_score: scoreData.overall_score || 0,
                citation_coverage: scoreData.citation_coverage || 0,
                flagged_claim_rate: scoreData.flagged_claim_rate || 0,
                revision_count: scoreData.revision_count || 0,
              }
            : null,
          solution: solutionData
            ? {
                id: solutionData.id,
                title: solutionData.title,
                content: solutionData.content,
                summary: solutionData.summary,
                intended_owner: solutionData.intended_owner,
                timeline: solutionData.timeline,
                cost_band: solutionData.cost_band,
                staffing_assumptions: solutionData.staffing_assumptions,
                dependencies: solutionData.dependencies,
                risks_mitigations: solutionData.risks_mitigations,
                success_metrics: Array.isArray(solutionData.success_metrics) ? solutionData.success_metrics : [],
                is_published: solutionData.is_published,
              }
            : null,
          replay: replayData
            ? {
                id: replayData.id,
                script: replayData.script,
                duration_seconds: replayData.duration_seconds || 30,
                timestamp_jumps: Array.isArray(replayData.timestamp_jumps) ? replayData.timestamp_jumps : [],
              }
            : null,
        };

        setMission(formatted);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMission();

    // Subscribe to realtime updates for messages
    const channel = supabase
      .channel(`mission_${missionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "debate_messages",
          filter: `mission_id=eq.${missionId}`,
        },
        async (payload) => {
          // Fetch the new message with agent
          const { data } = await supabase
            .from("debate_messages")
            .select(`
              *,
              agents!inner(id, name, role, bias_statement, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const newMessage: DebateMessage = {
              id: data.id,
              agent_id: data.agent_id,
              round_number: data.round_number,
              content: data.content,
              lane: data.lane as "proposal" | "support" | "counter",
              created_at: data.created_at,
              agent: (data as any).agents
                ? {
                    id: (data as any).agents.id,
                    name: (data as any).agents.name,
                    role: (data as any).agents.role,
                    bias_statement: (data as any).agents.bias_statement,
                    avatar_url: (data as any).agents.avatar_url,
                  }
                : null,
            };

            setMission((prev) =>
              prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  return { mission, isLoading, error };
}
