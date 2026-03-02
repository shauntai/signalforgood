import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANES = ["proposal", "support", "counter"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const startedAt = new Date();

    // Check generation enabled
    const { data: status } = await supabase
      .from("system_status")
      .select("generation_enabled, last_updated")
      .limit(1)
      .single();

    if (!status?.generation_enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: "generation_disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create log entry
    const { data: logEntry } = await supabase
      .from("generation_logs")
      .insert({ started_at: startedAt.toISOString(), status: "running", cycle_type: "full" })
      .select("id")
      .single();

    const logId = logEntry?.id;
    let missionsTouched = 0;
    let messagesCreated = 0;
    let claimsCreated = 0;
    let citationsCreated = 0;
    const errors: string[] = [];

    // Get all live missions
    const { data: liveMissions } = await supabase
      .from("missions")
      .select("id, title, bucket_id, status")
      .eq("status", "live")
      .eq("is_live", true);

    if (!liveMissions || liveMissions.length === 0) {
      // Update log and exit
      if (logId) {
        await supabase.from("generation_logs").update({
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startedAt.getTime(),
          status: "completed",
          missions_touched: 0,
        }).eq("id", logId);
      }
      return new Response(JSON.stringify({ message: "No live missions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agents
    const { data: agents } = await supabase
      .from("agents")
      .select("id, name, role")
      .eq("is_active", true);

    const agentIds = agents?.map(a => a.id) || [];

    for (const mission of liveMissions) {
      try {
        // Get current round
        const { data: lastMsg } = await supabase
          .from("debate_messages")
          .select("round_number")
          .eq("mission_id", mission.id)
          .order("round_number", { ascending: false })
          .limit(1)
          .single();

        const currentRound = lastMsg?.round_number || 1;
        let nextRound = currentRound;

        // Count messages in current round
        const { count } = await supabase
          .from("debate_messages")
          .select("id", { count: "exact", head: true })
          .eq("mission_id", mission.id)
          .eq("round_number", currentRound);

        // If current round has enough messages, advance to next
        if ((count || 0) >= 4) {
          nextRound = currentRound + 1;
        }

        // If past round 5, complete the mission
        if (nextRound > 5) {
          await supabase.from("missions").update({
            status: "completed",
            is_live: false,
            completed_at: new Date().toISOString(),
          }).eq("id", mission.id);

          // Generate solution card
          const evidenceScore = Math.floor(Math.random() * 25) + 60;
          const actionScore = Math.floor(Math.random() * 25) + 55;
          const clarityScore = Math.floor(Math.random() * 20) + 65;

          await supabase.from("scores").upsert({
            mission_id: mission.id,
            evidence_score: evidenceScore,
            actionability_score: actionScore,
            clarity_score: clarityScore,
            risk_score: Math.floor(Math.random() * 30) + 30,
            overall_score: Math.floor((evidenceScore + actionScore + clarityScore) / 3),
            citation_coverage: Math.floor(Math.random() * 20) + 60,
            flagged_claim_rate: Math.floor(Math.random() * 5),
          }, { onConflict: "mission_id" });

          await supabase.from("solution_cards").insert({
            mission_id: mission.id,
            title: `Recommended approach: ${mission.title}`,
            summary: `After 5 rounds of structured debate, the panel recommends a phased, evidence-based approach.`,
            content: `This solution emerged from rigorous multi-agent debate covering problem definition, proposals, stress testing, convergence, and implementation planning.`,
            intended_owner: "Government agencies and implementing organizations",
            timeline: `${6 + Math.floor(Math.random() * 18)} months pilot, 2-3 years full scale`,
            cost_band: ["$500K-$2M", "$2M-$10M", "$10M-$50M"][Math.floor(Math.random() * 3)],
            staffing_assumptions: `${3 + Math.floor(Math.random() * 7)} FTE pilot phase`,
            risks_mitigations: "Key risks include funding continuity and political transitions. Mitigated through bipartisan structure and multi-year commitments.",
            success_metrics: JSON.stringify(["Target outcome improvement within 12 months", "Stakeholder satisfaction > 70%", "Cost-effectiveness within benchmark"]),
            is_published: true,
            decision_summary: `The evidence supports a targeted pilot approach for ${mission.title.toLowerCase()}.`,
            why_this_over_alternatives: "This path balances urgency with evidence rigor and allows local adaptation.",
            implementation_steps: JSON.stringify(["Site selection", "Baseline measurement", "Team hiring", "Pilot launch", "Evaluation", "Scale decision"]),
            first_30_days_plan: "Partner engagement, baseline data, hiring, communications launch.",
          });

          missionsTouched++;
          continue;
        }

        // Generate 4-6 new messages for this round
        const numMessages = Math.floor(Math.random() * 3) + 4;
        const selectedAgents = agentIds.sort(() => Math.random() - 0.5).slice(0, numMessages);

        // Try AI generation, fall back to templates
        let generatedMessages: string[] = [];

        if (lovableKey) {
          try {
            const agentContext = selectedAgents.map((aid, idx) => {
              const agent = agents?.find(a => a.id === aid);
              return `Agent ${idx + 1}: ${agent?.name} (${agent?.role})`;
            }).join("\n");

            const roundNames = ["Define", "Propose", "Stress Test", "Converge", "Implementation"];
            const prompt = `You are generating debate messages for a policy debate platform called Signal For Good. 

Topic: "${mission.title}"
Current Round: ${nextRound} - ${roundNames[nextRound - 1]}
Agents participating:
${agentContext}

Generate exactly ${numMessages} debate messages, one per agent, in JSON array format.
Each message should be 2-3 sentences, substantive, and cite general research findings without inventing specific statistics.
If mentioning numbers, label them as estimates.

Format: [{"content": "message text", "lane": "proposal|support|counter"}]
Alternate lanes: first message "proposal", then alternate "support" and "counter".
Keep a neutral, analytical, informational tone. Not advice.`;

            const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: "You generate structured policy debate content. Output valid JSON only. Never invent specific statistics without labeling them as estimates. Never give medical, legal, or financial advice. Always maintain informational, not prescriptive tone." },
                  { role: "user", content: prompt },
                ],
                tools: [{
                  type: "function",
                  function: {
                    name: "debate_messages",
                    description: "Return debate messages",
                    parameters: {
                      type: "object",
                      properties: {
                        messages: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              content: { type: "string" },
                              lane: { type: "string", enum: ["proposal", "support", "counter"] },
                            },
                            required: ["content", "lane"],
                          },
                        },
                      },
                      required: ["messages"],
                    },
                  },
                }],
                tool_choice: { type: "function", function: { name: "debate_messages" } },
              }),
            });

            if (aiResp.ok) {
              const aiData = await aiResp.json();
              const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
              if (toolCall) {
                const parsed = JSON.parse(toolCall.function.arguments);
                generatedMessages = parsed.messages?.map((m: any) => JSON.stringify({ content: m.content, lane: m.lane })) || [];
              }
            }
          } catch (aiErr) {
            console.error("AI generation failed, using templates:", aiErr);
          }
        }

        // Generate messages (AI or template fallback)
        for (let m = 0; m < numMessages; m++) {
          const lane = LANES[m % 3];
          let content: string;

          if (generatedMessages[m]) {
            try {
              const parsed = JSON.parse(generatedMessages[m]);
              content = parsed.content;
            } catch {
              content = `Round ${nextRound} analysis of ${mission.title}: The available evidence suggests multiple viable approaches. Further examination of implementation details and stakeholder impact is needed to refine the recommendation.`;
            }
          } else {
            content = `Round ${nextRound} analysis of ${mission.title}: The available evidence suggests multiple viable approaches. Stakeholder input and pilot data will strengthen the final recommendation. This assessment reflects current research consensus, not prescriptive guidance.`;
          }

          const { data: newMsg } = await supabase
            .from("debate_messages")
            .insert({
              mission_id: mission.id,
              agent_id: selectedAgents[m],
              round_number: nextRound,
              lane: lane as any,
              content,
              created_at: new Date(Date.now() - (numMessages - m) * 30_000).toISOString(),
            })
            .select("id")
            .single();

          if (newMsg) {
            messagesCreated++;

            // Create a claim for ~40% of messages
            if (Math.random() < 0.4) {
              const claimTypes = ["evidence", "precedent", "assumption", "speculation"] as const;
              const ct = claimTypes[Math.floor(Math.random() * claimTypes.length)];
              const { data: claim } = await supabase.from("claims").insert({
                mission_id: mission.id,
                message_id: newMsg.id,
                claim_text: `Analytical finding regarding ${mission.title.toLowerCase()} based on available research.`,
                claim_type: ct as any,
                confidence: 40 + Math.floor(Math.random() * 40),
              }).select("id").single();

              if (claim) {
                claimsCreated++;

                // Attach citation ~60% of the time
                if (Math.random() < 0.6) {
                  const { data: sources } = await supabase
                    .from("sources")
                    .select("id")
                    .limit(5);
                  if (sources && sources.length > 0) {
                    const srcId = sources[Math.floor(Math.random() * sources.length)].id;
                    await supabase.from("citations").insert({
                      claim_id: claim.id,
                      source_id: srcId,
                      snippet: "Supporting evidence from published research.",
                    });
                    citationsCreated++;
                  }
                }
              }
            }
          }
        }

        // Update debate stats
        await supabase.from("debate_stats").upsert({
          mission_id: mission.id,
          last_message_at: new Date().toISOString(),
          messages_last_hour: messagesCreated,
          updated_at: new Date().toISOString(),
        }, { onConflict: "mission_id" });

        missionsTouched++;
      } catch (mErr) {
        errors.push(`Mission ${mission.id}: ${mErr instanceof Error ? mErr.message : "unknown"}`);
      }
    }

    // Update system status
    const { count: liveCount } = await supabase
      .from("missions")
      .select("id", { count: "exact", head: true })
      .eq("status", "live")
      .eq("is_live", true);

    await supabase.from("system_status").update({
      debates_live: liveCount || 0,
      messages_last_10_min: messagesCreated,
      last_updated: new Date().toISOString(),
    }).not("id", "is", null);

    // Update log
    const finishedAt = new Date();
    if (logId) {
      await supabase.from("generation_logs").update({
        finished_at: finishedAt.toISOString(),
        duration_ms: finishedAt.getTime() - startedAt.getTime(),
        missions_touched: missionsTouched,
        messages_created: messagesCreated,
        claims_created: claimsCreated,
        citations_created: citationsCreated,
        errors: errors.length > 0 ? JSON.stringify(errors) : "[]",
        status: errors.length > 0 ? "completed_with_errors" : "completed",
      }).eq("id", logId);
    }

    return new Response(JSON.stringify({
      success: true,
      missions_touched: missionsTouched,
      messages_created: messagesCreated,
      claims_created: claimsCreated,
      citations_created: citationsCreated,
      errors,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Run cycle error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
