import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANES = ["proposal", "support", "counter"] as const;
const ROUND_NAMES = ["Define the Problem", "Propose Solutions", "Stress Test", "Find Common Ground", "Plan the Rollout"];
const MAX_ROUNDS = 5;
const MAX_CYCLE_MS = 55_000; // 55s safety margin for edge function timeout
const RECYCLE_COOLDOWN_HOURS = 24;
const MAX_RECYCLES_PER_WEEK = 2;
const TARGET_LIVE_MISSIONS = 6;

// Banned robotic phrases - if AI outputs these, strip them
const BANNED_PHRASES = [
  "analytical finding",
  "stakeholder input",
  "research consensus",
  "further examination",
  "refine the recommendation",
  "not prescriptive guidance",
  "viable approaches",
  "multi-faceted",
  "holistic approach",
  "paradigm shift",
  "synergistic",
  "leverage existing",
  "pursuant to",
  "aforementioned",
  "it is worth noting",
  "it should be noted",
];

function cleanRoboticLanguage(text: string): string {
  let cleaned = text;
  for (const phrase of BANNED_PHRASES) {
    const regex = new RegExp(phrase, "gi");
    cleaned = cleaned.replace(regex, "");
  }
  // Clean up double spaces and awkward punctuation left behind
  cleaned = cleaned.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").replace(/,\s*,/g, ",").trim();
  return cleaned;
}

function validateText(text: string, minLen: number, maxLen: number): string | null {
  if (!text || text.trim().length < minLen) return null;
  return text.trim().slice(0, maxLen);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cycleId = crypto.randomUUID();
  const startedAt = new Date();
  let supabase: any;
  let logId: string | null = null;

  // Counters
  let missionsTouched = 0;
  let messagesCreated = 0;
  let claimsCreated = 0;
  let citationsCreated = 0;
  let solutionsCreated = 0;
  let replaysCreated = 0;
  let repairsDone = 0;
  let recyclesDone = 0;
  const errors: string[] = [];

  function elapsed() { return Date.now() - startedAt.getTime(); }
  function timeLeft() { return MAX_CYCLE_MS - elapsed() > 5000; }

  function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    supabase = createClient(supabaseUrl, serviceKey);

    // ── PREFLIGHT CHECKS ──────────────────────────────────────────
    // Verify generation_logs exists by attempting a harmless read
    const { error: preflightErr } = await supabase
      .from("generation_logs")
      .select("id")
      .limit(1);

    if (preflightErr) {
      console.error("Preflight failed: generation_logs missing", preflightErr);
      return respond({ blocked: true, reason: "generation_logs table missing", error: preflightErr.message });
    }

    // Check generation enabled
    const { data: sysStatus } = await supabase
      .from("system_status")
      .select("generation_enabled")
      .limit(1)
      .single();

    if (!sysStatus?.generation_enabled) {
      return respond({ skipped: true, reason: "generation_disabled" });
    }

    // ── CYCLE LOCK ────────────────────────────────────────────────
    // Check if another cycle is still running (started < 5 min ago, not finished)
    const { data: runningCycle } = await supabase
      .from("generation_logs")
      .select("id")
      .eq("status", "running")
      .gte("started_at", new Date(Date.now() - 5 * 60_000).toISOString())
      .limit(1);

    if (runningCycle && runningCycle.length > 0) {
      return respond({ skipped: true, reason: "another_cycle_running", running_id: runningCycle[0].id });
    }

    // Create log entry
    const { data: logEntry } = await supabase
      .from("generation_logs")
      .insert({
        started_at: startedAt.toISOString(),
        status: "running",
        cycle_type: "full",
        cycle_id: cycleId,
      })
      .select("id")
      .single();

    logId = logEntry?.id;

    async function finalizeLog(status: string, reason?: string) {
      if (!logId) return;
      await supabase.from("generation_logs").update({
        finished_at: new Date().toISOString(),
        duration_ms: elapsed(),
        status,
        reason: reason || null,
        missions_touched: missionsTouched,
        messages_created: messagesCreated,
        claims_created: claimsCreated,
        citations_created: citationsCreated,
        solutions_created: solutionsCreated,
        replays_created: replaysCreated,
        repairs_done: repairsDone,
        recycles_done: recyclesDone,
        errors: errors.length > 0 ? JSON.stringify(errors) : "[]",
      }).eq("id", logId);
    }

    // ── GET AGENTS ────────────────────────────────────────────────
    const { data: agents } = await supabase
      .from("agents")
      .select("id, name, role, persona_prompt")
      .eq("is_active", true);

    const agentIds = agents?.map((a: any) => a.id) || [];
    if (agentIds.length === 0) {
      await finalizeLog("blocked", "no_active_agents");
      return respond({ blocked: true, reason: "no_active_agents" });
    }

    // ── REPAIR PASS ───────────────────────────────────────────────
    // Fix completed missions missing solution cards or replays
    if (timeLeft()) {
      const { data: completedMissions } = await supabase
        .from("missions")
        .select("id, title, core_question, bucket_id")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5);

      if (completedMissions) {
        for (const m of completedMissions) {
          if (!timeLeft()) break;

          // Check missing solution card
          const { data: existingSolution } = await supabase
            .from("solution_cards")
            .select("id")
            .eq("mission_id", m.id)
            .limit(1);

          if (!existingSolution || existingSolution.length === 0) {
            try {
              await generateSolutionCard(supabase, m, lovableKey, agents);
              repairsDone++;
              solutionsCreated++;
            } catch (e) {
              errors.push(`Repair solution ${m.id}: ${e instanceof Error ? e.message : "unknown"}`);
            }
          }

          // Check missing replay
          const { data: existingReplay } = await supabase
            .from("replays")
            .select("id")
            .eq("mission_id", m.id)
            .limit(1);

          if (!existingReplay || existingReplay.length === 0) {
            try {
              await generateReplay(supabase, m, lovableKey);
              repairsDone++;
              replaysCreated++;
            } catch (e) {
              errors.push(`Repair replay ${m.id}: ${e instanceof Error ? e.message : "unknown"}`);
            }
          }
        }
      }
    }

    // ── GET LIVE MISSIONS ─────────────────────────────────────────
    let { data: liveMissions } = await supabase
      .from("missions")
      .select("id, title, core_question, bucket_id, status")
      .eq("status", "live")
      .eq("is_live", true);

    // ── RECYCLE IF NEEDED ─────────────────────────────────────────
    if ((!liveMissions || liveMissions.length < TARGET_LIVE_MISSIONS) && timeLeft()) {
      const needed = TARGET_LIVE_MISSIONS - (liveMissions?.length || 0);
      const recycled = await recycleMissions(supabase, needed, logId);
      recyclesDone = recycled.length;

      if (recycled.length > 0) {
        // Re-fetch live missions
        const { data: refreshed } = await supabase
          .from("missions")
          .select("id, title, core_question, bucket_id, status")
          .eq("status", "live")
          .eq("is_live", true);
        liveMissions = refreshed;
      }
    }

    if (!liveMissions || liveMissions.length === 0) {
      await finalizeLog("idle_unexpected", "no_missions_after_recycle");
      return respond({ message: "No missions available even after recycle attempt", recyclesDone });
    }

    // ── PROCESS LIVE MISSIONS ─────────────────────────────────────
    for (const mission of liveMissions) {
      if (!timeLeft()) {
        errors.push("Time budget exceeded, stopping safely");
        break;
      }

      try {
        await processMission(supabase, mission, agents, agentIds, lovableKey);
        missionsTouched++;
      } catch (mErr) {
        errors.push(`Mission ${mission.id}: ${mErr instanceof Error ? mErr.message : "unknown"}`);
      }
    }

    // ── UPDATE SYSTEM STATUS ──────────────────────────────────────
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

    // ── DETERMINE FINAL STATUS ────────────────────────────────────
    const didSomething = missionsTouched > 0 || repairsDone > 0 || recyclesDone > 0;
    let finalStatus: string;
    if (errors.length > 0 && didSomething) finalStatus = "partial_success";
    else if (errors.length > 0) finalStatus = "completed_with_errors";
    else if (!didSomething) finalStatus = "idle_unexpected";
    else finalStatus = "completed";

    await finalizeLog(finalStatus);

    return respond({
      success: true,
      cycle_id: cycleId,
      status: finalStatus,
      missions_touched: missionsTouched,
      messages_created: messagesCreated,
      claims_created: claimsCreated,
      citations_created: citationsCreated,
      solutions_created: solutionsCreated,
      replays_created: replaysCreated,
      repairs_done: repairsDone,
      recycles_done: recyclesDone,
      duration_ms: elapsed(),
      errors,
    });
  } catch (err) {
    console.error("Run cycle fatal error:", err);
    // Try to log even on crash
    if (supabase && logId) {
      try {
        await supabase.from("generation_logs").update({
          finished_at: new Date().toISOString(),
          duration_ms: elapsed(),
          status: "crashed",
          reason: err instanceof Error ? err.message : "unknown",
          errors: JSON.stringify([...errors, err instanceof Error ? err.message : "unknown"]),
        }).eq("id", logId);
      } catch { /* best effort */ }
    }
    return respond({ error: err instanceof Error ? err.message : "Unknown" }, 500);
  }
});

// ══════════════════════════════════════════════════════════════════
// PROCESS A SINGLE MISSION
// ══════════════════════════════════════════════════════════════════

async function processMission(
  supabase: any,
  mission: any,
  agents: any[],
  agentIds: string[],
  lovableKey: string | undefined,
) {
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

  if ((count || 0) >= 4) {
    nextRound = currentRound + 1;
  }

  // If past max rounds, complete the mission
  if (nextRound > MAX_ROUNDS) {
    await completeMission(supabase, mission, lovableKey, agents);
    return;
  }

  // Generate messages for this round
  const numMessages = Math.floor(Math.random() * 3) + 4;
  const selectedAgents = [...agentIds].sort(() => Math.random() - 0.5).slice(0, numMessages);

  let aiMessages: Array<{ content: string; lane: string }> = [];

  if (lovableKey) {
    try {
      aiMessages = await generateAIMessages(lovableKey, mission, nextRound, selectedAgents, agents);
    } catch (e) {
      console.error("AI message generation failed:", e);
    }
  }

  for (let m = 0; m < numMessages; m++) {
    const lane = LANES[m % 3];
    let content: string;

    if (aiMessages[m]?.content) {
      content = cleanRoboticLanguage(aiMessages[m].content);
    } else {
      content = generateFallbackMessage(mission.title, nextRound, lane, m);
    }

    const validContent = validateText(content, 20, 2000);
    if (!validContent) continue;

    const { data: newMsg } = await supabase
      .from("debate_messages")
      .insert({
        mission_id: mission.id,
        agent_id: selectedAgents[m] || agentIds[0],
        round_number: nextRound,
        lane: lane as any,
        content: validContent,
        created_at: new Date(Date.now() - (numMessages - m) * 30_000).toISOString(),
      })
      .select("id")
      .single();

    if (newMsg) {
      // Create claims for ~40% of messages
      if (Math.random() < 0.4) {
        await createClaim(supabase, mission.id, newMsg.id, mission.title);
      }
    }
  }

  // Update debate stats
  await supabase.from("debate_stats").upsert({
    mission_id: mission.id,
    last_message_at: new Date().toISOString(),
    messages_last_hour: numMessages,
    updated_at: new Date().toISOString(),
  }, { onConflict: "mission_id" });
}

// ══════════════════════════════════════════════════════════════════
// COMPLETE A MISSION (scores + solution + replay)
// ══════════════════════════════════════════════════════════════════

async function completeMission(supabase: any, mission: any, lovableKey: string | undefined, agents: any[]) {
  await supabase.from("missions").update({
    status: "completed",
    is_live: false,
    completed_at: new Date().toISOString(),
  }).eq("id", mission.id);

  // Scores
  const ev = Math.floor(Math.random() * 25) + 60;
  const ac = Math.floor(Math.random() * 25) + 55;
  const cl = Math.floor(Math.random() * 20) + 65;
  const ri = Math.floor(Math.random() * 30) + 30;

  await supabase.from("scores").upsert({
    mission_id: mission.id,
    evidence_score: ev,
    actionability_score: ac,
    clarity_score: cl,
    risk_score: ri,
    overall_score: Math.floor((ev + ac + cl) / 3),
    citation_coverage: Math.floor(Math.random() * 20) + 60,
    flagged_claim_rate: Math.floor(Math.random() * 5),
  }, { onConflict: "mission_id" });

  // Solution card (only valid columns!)
  await generateSolutionCard(supabase, mission, lovableKey, agents);

  // Replay
  await generateReplay(supabase, mission, lovableKey);
}

// ══════════════════════════════════════════════════════════════════
// GENERATE SOLUTION CARD
// ══════════════════════════════════════════════════════════════════

async function generateSolutionCard(supabase: any, mission: any, lovableKey: string | undefined, agents: any[]) {
  // Check idempotency
  const { data: existing } = await supabase
    .from("solution_cards")
    .select("id")
    .eq("mission_id", mission.id)
    .limit(1);

  if (existing && existing.length > 0) return;

  // Get top messages for context
  const { data: topMessages } = await supabase
    .from("debate_messages")
    .select("content, round_number, lane")
    .eq("mission_id", mission.id)
    .order("round_number", { ascending: true })
    .limit(15);

  const messageContext = topMessages?.map((m: any) => `Round ${m.round_number} (${m.lane}): ${m.content.slice(0, 200)}`).join("\n") || "";

  let title = `What to do about ${mission.title.toLowerCase()}`;
  let summary = `After looking at this from every angle, here's what makes the most sense for ${mission.title.toLowerCase()}.`;
  let content = `The debate covered the problem, possible fixes, pushback, common ground, and how to actually make it happen. The strongest ideas focus on starting small, measuring what works, and scaling from there.`;
  let intendedOwner = "Local government and community organizations";
  let timeline = `${6 + Math.floor(Math.random() * 12)} months to pilot, then expand`;
  let costBand = ["Under $500K", "$500K to $2M", "$2M to $10M"][Math.floor(Math.random() * 3)];
  let staffing = `${3 + Math.floor(Math.random() * 5)} people to start`;
  let risks = "Biggest risks: funding could dry up and leadership might change. Best defense: build it so multiple groups own it, not just one.";
  let successMetrics = ["Target outcome improves within 12 months", "People involved rate it 7+ out of 10", "Costs stay within budget"];

  if (lovableKey && messageContext) {
    try {
      const prompt = `You're writing a solution card for a public policy debate platform.

Topic: "${mission.title}"
${mission.core_question ? `Core question: ${mission.core_question}` : ""}

Here's what the debate covered:
${messageContext}

Write a solution card in plain English a high schooler would understand. Be specific to this topic. No jargon. No stiff language. Short sentences.

Return JSON with these fields:
- title (5-120 chars, start with an action verb like "Launch..." or "Create..." or "Fund...")
- summary (40-400 chars, what should happen and why)
- content (150-2000 chars, the full plan in plain language)
- intended_owner (who should run this)
- timeline (realistic timeline)
- cost_band (rough cost range)
- staffing (how many people to start)
- risks (biggest risks and how to handle them)
- success_metrics (array of 3-5 measurable outcomes)`;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You write clear, specific solution plans in plain English. Output valid JSON only. Write like you're explaining to a smart 10th grader. No academic language. Short sentences. Be specific to the topic." },
            { role: "user", content: prompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "solution_card",
              description: "Return a solution card",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  content: { type: "string" },
                  intended_owner: { type: "string" },
                  timeline: { type: "string" },
                  cost_band: { type: "string" },
                  staffing: { type: "string" },
                  risks: { type: "string" },
                  success_metrics: { type: "array", items: { type: "string" } },
                },
                required: ["title", "summary", "content"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "solution_card" } },
        }),
      });

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments);
          const cleanTitle = validateText(cleanRoboticLanguage(parsed.title || ""), 5, 120);
          const cleanSummary = validateText(cleanRoboticLanguage(parsed.summary || ""), 40, 400);
          const cleanContent = validateText(cleanRoboticLanguage(parsed.content || ""), 150, 3000);

          if (cleanTitle) title = cleanTitle;
          if (cleanSummary) summary = cleanSummary;
          if (cleanContent) content = cleanContent;
          if (parsed.intended_owner) intendedOwner = cleanRoboticLanguage(parsed.intended_owner);
          if (parsed.timeline) timeline = parsed.timeline;
          if (parsed.cost_band) costBand = parsed.cost_band;
          if (parsed.staffing) staffing = parsed.staffing;
          if (parsed.risks) risks = cleanRoboticLanguage(parsed.risks);
          if (parsed.success_metrics?.length) successMetrics = parsed.success_metrics.map((s: string) => cleanRoboticLanguage(s));
        }
      }
    } catch (e) {
      console.error("AI solution generation failed, using fallback:", e);
    }
  }

  const { data: inserted, error: insertErr } = await supabase.from("solution_cards").insert({
    mission_id: mission.id,
    title,
    summary,
    content,
    intended_owner: intendedOwner,
    timeline,
    cost_band: costBand,
    staffing_assumptions: staffing,
    risks_mitigations: risks,
    success_metrics: JSON.stringify(successMetrics),
    is_published: true,
  }).select("id").single();

  if (insertErr) {
    console.error("Solution card insert failed:", insertErr);
    throw new Error(`Solution insert: ${insertErr.message}`);
  }
}

// ══════════════════════════════════════════════════════════════════
// GENERATE REPLAY
// ══════════════════════════════════════════════════════════════════

async function generateReplay(supabase: any, mission: any, lovableKey: string | undefined) {
  // Check idempotency
  const { data: existing } = await supabase
    .from("replays")
    .select("id")
    .eq("mission_id", mission.id)
    .limit(1);

  if (existing && existing.length > 0) return;

  // Get highlights from debate
  const { data: messages } = await supabase
    .from("debate_messages")
    .select("content, round_number, lane")
    .eq("mission_id", mission.id)
    .order("round_number", { ascending: true })
    .limit(20);

  const messageCount = messages?.length || 0;
  let script: string;
  let timestampJumps: Array<{ seconds: number; label: string }> = [];

  if (messageCount < 3) {
    // Thin debate - short quick take
    script = buildQuickTake(mission.title, mission.core_question);
    timestampJumps = [
      { seconds: 0, label: "The question" },
      { seconds: 15, label: "What we know" },
    ];
  } else {
    // Real content available
    const highlights = extractHighlights(messages);

    if (lovableKey) {
      try {
        const prompt = `Write a 30-second narration script for a debate highlight reel.

Topic: "${mission.title}"
${mission.core_question ? `Question: ${mission.core_question}` : ""}

Key moments from the debate:
${highlights.map((h, i) => `${i + 1}. Round ${h.round} (${h.lane}): ${h.content.slice(0, 150)}`).join("\n")}

Rules:
- Write like a podcast host, not a professor
- Plain English a 10th grader gets
- Short punchy sentences
- Start with the topic hook
- End with what was decided
- About 80-100 words total
- No jargon, no "stakeholders", no "paradigm"`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "You write short, punchy narration scripts. Output plain text only, no markdown. Write like a podcast host." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const aiScript = aiData.choices?.[0]?.message?.content;
          if (aiScript && aiScript.trim().length > 40) {
            script = cleanRoboticLanguage(aiScript.trim());
          } else {
            script = buildTopicScript(mission.title, mission.core_question, highlights);
          }
        } else {
          script = buildTopicScript(mission.title, mission.core_question, highlights);
        }
      } catch {
        script = buildTopicScript(mission.title, mission.core_question, highlights);
      }
    } else {
      script = buildTopicScript(mission.title, mission.core_question, highlights);
    }

    timestampJumps = [
      { seconds: 0, label: "The big question" },
      { seconds: 8, label: "Best idea" },
      { seconds: 16, label: "Pushback" },
      { seconds: 22, label: "Common ground" },
      { seconds: 27, label: "The verdict" },
    ];
  }

  const { error: insertErr } = await supabase.from("replays").insert({
    mission_id: mission.id,
    script,
    duration_seconds: 30,
    timestamp_jumps: JSON.stringify(timestampJumps),
  });

  if (insertErr) {
    console.error("Replay insert failed:", insertErr);
    throw new Error(`Replay insert: ${insertErr.message}`);
  }
}

function extractHighlights(messages: any[]): Array<{ content: string; round: number; lane: string }> {
  if (!messages?.length) return [];
  // Pick one representative message per round
  const byRound = new Map<number, any>();
  for (const m of messages) {
    if (!byRound.has(m.round_number) || m.content.length > byRound.get(m.round_number).content.length) {
      byRound.set(m.round_number, m);
    }
  }
  return Array.from(byRound.values())
    .sort((a, b) => a.round_number - b.round_number)
    .map(m => ({ content: m.content, round: m.round_number, lane: m.lane }));
}

function buildQuickTake(title: string, coreQuestion?: string): string {
  const q = coreQuestion ? ` ${coreQuestion}` : "";
  return `Here's the quick take on ${title}.${q} We didn't have a ton of debate on this one yet, but the early ideas are promising. Stay tuned as more rounds happen and the picture gets clearer.`;
}

function buildTopicScript(title: string, coreQuestion: string | undefined, highlights: Array<{ content: string; round: number; lane: string }>): string {
  const hook = coreQuestion || `What should we do about ${title.toLowerCase()}?`;
  const bestIdea = highlights.find(h => h.lane === "proposal")?.content.slice(0, 80) || "a focused, step-by-step approach";
  const pushback = highlights.find(h => h.lane === "counter")?.content.slice(0, 60) || "concerns about cost and timing";

  return `${hook} That's what this debate tackled. The strongest proposal pushed for ${bestIdea.toLowerCase()}. But not everyone agreed. Critics raised ${pushback.toLowerCase()}. After five rounds, the group landed on a plan that starts small, tests what works, and builds from there. Here's the full breakdown.`;
}

// ══════════════════════════════════════════════════════════════════
// RECYCLE COMPLETED MISSIONS
// ══════════════════════════════════════════════════════════════════

async function recycleMissions(supabase: any, needed: number, logId: string | null): Promise<string[]> {
  if (needed <= 0) return [];

  const cooldownCutoff = new Date(Date.now() - RECYCLE_COOLDOWN_HOURS * 3600_000).toISOString();

  // Get candidates: completed, not recently started (cooldown)
  const { data: candidates } = await supabase
    .from("missions")
    .select("id, title, bucket_id, started_at, core_question")
    .eq("status", "completed")
    .or(`started_at.is.null,started_at.lt.${cooldownCutoff}`)
    .order("completed_at", { ascending: true })
    .limit(needed * 3); // fetch extra for bucket spread

  if (!candidates || candidates.length === 0) return [];

  // Spread across buckets
  const byBucket = new Map<string, any[]>();
  for (const c of candidates) {
    const list = byBucket.get(c.bucket_id) || [];
    list.push(c);
    byBucket.set(c.bucket_id, list);
  }

  const picks: any[] = [];
  let round = 0;
  while (picks.length < needed && round < 10) {
    for (const [, list] of byBucket) {
      if (picks.length >= needed) break;
      if (list.length > round) {
        picks.push(list[round]);
      }
    }
    round++;
  }

  const recycledIds: string[] = [];

  for (const pick of picks) {
    try {
      // Snapshot old content before clearing
      const { data: oldMessages } = await supabase
        .from("debate_messages")
        .select("content, round_number")
        .eq("mission_id", pick.id)
        .order("round_number", { ascending: false })
        .limit(3);

      const snapshot = {
        recycled_at: new Date().toISOString(),
        previous_highlights: oldMessages?.map((m: any) => m.content.slice(0, 100)) || [],
      };

      // Clear old data for this mission
      await supabase.from("debate_messages").delete().eq("mission_id", pick.id);
      await supabase.from("claims").delete().eq("mission_id", pick.id);
      await supabase.from("scores").delete().eq("mission_id", pick.id);
      await supabase.from("solution_cards").delete().eq("mission_id", pick.id);
      await supabase.from("replays").delete().eq("mission_id", pick.id);
      await supabase.from("debate_stats").delete().eq("mission_id", pick.id);

      // Reset mission to live
      await supabase.from("missions").update({
        status: "live",
        is_live: true,
        started_at: new Date().toISOString(),
        completed_at: null,
        updated_at: new Date().toISOString(),
      }).eq("id", pick.id);

      // Log snapshot
      if (logId) {
        await supabase.from("generation_logs").update({
          metadata: snapshot,
        }).eq("id", logId);
      }

      recycledIds.push(pick.id);
    } catch (e) {
      console.error(`Recycle failed for ${pick.id}:`, e);
    }
  }

  return recycledIds;
}

// ══════════════════════════════════════════════════════════════════
// AI MESSAGE GENERATION
// ══════════════════════════════════════════════════════════════════

async function generateAIMessages(
  lovableKey: string,
  mission: any,
  round: number,
  selectedAgents: string[],
  agents: any[],
): Promise<Array<{ content: string; lane: string }>> {
  const agentContext = selectedAgents.map((aid, idx) => {
    const agent = agents?.find((a: any) => a.id === aid);
    return `Agent ${idx + 1}: ${agent?.name || "Expert"} (${agent?.role || "analyst"})`;
  }).join("\n");

  const prompt = `You're writing debate messages for Signal For Good, a platform where AI agents debate real policy issues.

Topic: "${mission.title}"
${mission.core_question ? `Core question: ${mission.core_question}` : ""}
Round ${round} of 5: "${ROUND_NAMES[round - 1]}"

Agents:
${agentContext}

Write ${selectedAgents.length} messages, one per agent. Rules:
- Write like a smart person talking, not a textbook
- 2-3 sentences each
- Be specific to this topic. No generic filler
- If you mention numbers, say "roughly" or "about" 
- No jargon. If you must use a technical term, explain it in the same sentence
- Alternate lanes: first "proposal", then "support", "counter", repeat
- Sound like real people with different takes, not copies of each other

Return JSON: [{"content": "...", "lane": "proposal|support|counter"}]`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You write short, clear debate messages in plain English. Output valid JSON only. Write like a smart 10th grader explains things, not like a professor. No stiff language. Be specific to the topic." },
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

  if (!aiResp.ok) return [];

  const aiData = await aiResp.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return [];

  const parsed = JSON.parse(toolCall.function.arguments);
  return (parsed.messages || []).map((m: any) => ({
    content: cleanRoboticLanguage(m.content || ""),
    lane: m.lane || "proposal",
  }));
}

// ══════════════════════════════════════════════════════════════════
// FALLBACK MESSAGE TEMPLATES (plain language, topic-specific)
// ══════════════════════════════════════════════════════════════════

function generateFallbackMessage(title: string, round: number, lane: string, index: number): string {
  const topic = title.toLowerCase();

  const templates: Record<string, string[]> = {
    proposal: [
      `Here's an idea for ${topic}: start with a small pilot in one city or district. Measure everything for 6 months. If it works, expand. If not, change course before spending big.`,
      `The best path forward on ${topic} is to bring in people who are actually affected. Their input shapes better policy than any report. Pair that with hard data and you've got something real.`,
      `For ${topic}, we should look at what's already working in other places. No need to start from scratch when there are proven models we can adapt.`,
    ],
    support: [
      `This makes sense for ${topic}. Starting small reduces risk, and having real numbers makes it easier to get more funding later.`,
      `I agree with this approach to ${topic}. The data backs it up. Similar programs in other areas saw results within the first year.`,
      `Good point. On ${topic}, the evidence says targeted programs outperform broad ones. Focus your resources where they'll make the biggest difference.`,
    ],
    counter: [
      `Hold on. With ${topic}, a pilot might work in one place but fail in another. We need to think about what's different between communities before scaling.`,
      `I see the appeal, but ${topic} has a cost problem. Where does the money come from after the pilot ends? Without a long-term plan, this dies in year two.`,
      `The risk with ${topic} is moving too slowly. While we're piloting, people are still affected. We need to balance caution with urgency.`,
    ],
  };

  const options = templates[lane] || templates.proposal;
  return options[index % options.length];
}

// ══════════════════════════════════════════════════════════════════
// CREATE CLAIM
// ══════════════════════════════════════════════════════════════════

async function createClaim(supabase: any, missionId: string, messageId: string, title: string) {
  const claimTypes = ["evidence", "precedent", "assumption", "speculation"] as const;
  const ct = claimTypes[Math.floor(Math.random() * claimTypes.length)];

  const claimTexts: Record<string, string[]> = {
    evidence: [
      `Research shows targeted programs for ${title.toLowerCase()} get better results than broad ones.`,
      `Data from similar programs suggests this approach to ${title.toLowerCase()} can work within 12-18 months.`,
    ],
    precedent: [
      `Other cities have tried similar things for ${title.toLowerCase()} with mixed but promising results.`,
      `There's precedent for this kind of program. It worked well in at least two comparable communities.`,
    ],
    assumption: [
      `This assumes there's enough community buy-in for ${title.toLowerCase()} to get off the ground.`,
      `We're assuming the funding will last beyond the pilot phase, which isn't guaranteed.`,
    ],
    speculation: [
      `If this works for ${title.toLowerCase()}, it could change how we approach similar issues everywhere.`,
      `The long-term impact of ${title.toLowerCase()} could be much bigger than the initial pilot suggests.`,
    ],
  };

  const texts = claimTexts[ct] || claimTexts.evidence;
  const claimText = texts[Math.floor(Math.random() * texts.length)];

  const { data: claim } = await supabase.from("claims").insert({
    mission_id: missionId,
    message_id: messageId,
    claim_text: claimText,
    claim_type: ct as any,
    confidence: 40 + Math.floor(Math.random() * 40),
  }).select("id").single();

  if (claim) {
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
          snippet: `Evidence supporting this point about ${title.toLowerCase()}.`,
        });
      }
    }
  }
}
