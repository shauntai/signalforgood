/*
 * Built-in content engine. Everything the public site shows is computed here
 * from fixed topic lists, so the site runs with no backend, no AI and no credits.
 * Output is deterministic: the same time window always yields the same content.
 * "Live" debates rotate every 2 hours and reveal new messages every few minutes.
 */
import { MISSION_TOPICS, SOURCES_BY_BUCKET, LANES, ROUND_NAMES, generateMessageContent } from "./seedSource";

export type Lane = "proposal" | "support" | "counter";
export type ClaimType = "evidence" | "precedent" | "assumption" | "speculation";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
export const ROTATION_MS = 2 * HOUR;
const MESSAGE_GAP_MS = 8 * MINUTE;
const LIVE_PER_BUCKET = 3;
const ROUNDS = 5;
const MIN_VISIBLE_LIVE_MESSAGES = 3;

const BUCKET_META: Record<string, { id: string; name: string; color: string }> = {
  education: { id: "education", name: "Education", color: "bucket-education" },
  jobs: { id: "jobs", name: "Jobs", color: "bucket-jobs" },
  housing: { id: "housing", name: "Housing", color: "bucket-housing" },
  health: { id: "health", name: "Health", color: "bucket-health" },
};

export const STATIC_AGENTS = [
  { id: "economist", name: "Economist", role: "Budget reality", bias_statement: "Leans toward options that pay for themselves.", avatar_url: null },
  { id: "labor-advocate", name: "Labor Advocate", role: "Fairness and access", bias_statement: "Puts the people most affected first.", avatar_url: null },
  { id: "policy-analyst", name: "Policy Analyst", role: "Data and measurement", bias_statement: "Trusts what can be measured.", avatar_url: null },
  { id: "skeptic", name: "Skeptic", role: "Risks and failure modes", bias_statement: "Assumes plans fail until shown otherwise.", avatar_url: null },
  { id: "practitioner", name: "Practitioner", role: "Real-world implementation", bias_statement: "Cares about what works on the ground.", avatar_url: null },
  { id: "historian", name: "Historian", role: "Lessons from the past", bias_statement: "Looks for what was tried before.", avatar_url: null },
  { id: "facilitator", name: "Facilitator", role: "Landing decisions", bias_statement: "Pushes the group toward a clear choice.", avatar_url: null },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r: () => number, min: number, max: number) => Math.round(min + r() * (max - min));
const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Topic {
  id: string;
  slug: string;
  index: number;
  title: string;
  question: string;
  hook: string;
}

const TOPICS: Topic[] = Object.entries(MISSION_TOPICS).flatMap(([slug, list]) =>
  list.map((t, index) => ({ id: slugify(t.title), slug, index, title: t.title, question: t.question, hook: t.hook }))
);

const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function windowStart(now: number) {
  return Math.floor(now / ROTATION_MS) * ROTATION_MS;
}

function isLiveNow(t: Topic, now: number) {
  const count = MISSION_TOPICS[t.slug].length;
  const w = Math.floor(now / ROTATION_MS);
  for (let k = 0; k < LIVE_PER_BUCKET; k++) {
    if ((w * LIVE_PER_BUCKET + k) % count === t.index) return true;
  }
  return false;
}

/** Days since this topic last finished. Stable within a rotation window. */
function completedDaysAgo(t: Topic) {
  return 1 + (hash(t.id) % 28);
}

const CONSTRAINTS = [
  "Must work within existing public budgets",
  "Must be measurable within 12 months",
  "Must not widen gaps between communities",
  "Must be realistic for small and large cities",
];

const OWNERS: Record<string, string[]> = {
  education: ["School district leaders", "State education agency", "City youth office"],
  jobs: ["Local workforce board", "State labor department", "Community college partners"],
  housing: ["City housing department", "Regional planning agency", "Housing authority"],
  health: ["County public health department", "Community clinics network", "State health agency"],
};

const COST_BANDS = ["Under $500K", "$500K to $2M", "$2M to $10M", "$10M+"];
const TIMELINES = ["6 months", "12 months", "18 months", "24 months"];

interface Built {
  messages: {
    id: string;
    mission_id: string;
    agent_id: string;
    round_number: number;
    content: string;
    lane: Lane;
    created_at: string;
    agent: (typeof STATIC_AGENTS)[number];
  }[];
  claims: {
    id: string;
    message_id: string;
    claim_text: string;
    claim_type: ClaimType;
    confidence: number;
    is_flagged: boolean;
    is_retracted: boolean;
    created_at: string;
  }[];
}

const CLAIM_TYPES: ClaimType[] = ["evidence", "evidence", "precedent", "assumption", "speculation"];

function buildDebate(t: Topic, now: number): Built {
  const live = isLiveNow(t, now);
  const r = rng(`${t.id}:${live ? windowStart(now) : "done"}`);
  const sources = SOURCES_BY_BUCKET[t.slug];
  const total = ROUNDS * LANES.length;
  const start = live
    ? windowStart(now) + (hash(t.id) % 7) * MINUTE
    : now - completedDaysAgo(t) * DAY - total * MESSAGE_GAP_MS;
  const visible = live
    ? Math.min(total, Math.max(MIN_VISIBLE_LIVE_MESSAGES, Math.floor((now - start) / MESSAGE_GAP_MS) + 1))
    : total;

  const messages: Built["messages"] = [];
  const claims: Built["claims"] = [];
  for (let i = 0; i < visible; i++) {
    const round = Math.floor(i / LANES.length) + 1;
    const lane = LANES[i % LANES.length];
    const agent = STATIC_AGENTS[(i + t.index) % STATIC_AGENTS.length];
    const src = pick(r, sources);
    const created = new Date(Math.min(now, start + i * MESSAGE_GAP_MS)).toISOString();
    const id = `${t.id}-m${i + 1}`;
    const base = generateMessageContent(t.title.toLowerCase(), round, lane, r);
    const content = `${base} One useful source here is "${src.title}" from ${src.publisher}.`;
    messages.push({ id, mission_id: t.id, agent_id: agent.id, round_number: round, content, lane, created_at: created, agent });
    const type = pick(r, CLAIM_TYPES);
    claims.push({
      id: `${id}-c`,
      message_id: id,
      claim_text: `${ROUND_NAMES[round - 1]}: ${base.split(/(?<=\.)\s/)[0]} (Source: ${src.publisher})`,
      claim_type: type,
      confidence: type === "evidence" ? between(r, 70, 94) : type === "precedent" ? between(r, 60, 85) : between(r, 40, 68),
      is_flagged: type === "speculation" && r() < 0.3,
      is_retracted: false,
      created_at: created,
    });
  }
  return { messages, claims };
}

function buildScore(t: Topic, claims: Built["claims"]) {
  const r = rng(`${t.id}:score`);
  const backed = claims.filter((c) => c.claim_type === "evidence" || c.claim_type === "precedent").length;
  const coverage = claims.length ? Math.round((backed / claims.length) * 100) : 0;
  const evidence = between(r, 62, 92);
  const actionability = between(r, 58, 90);
  const clarity = between(r, 65, 95);
  const risk = between(r, 20, 55);
  return {
    evidence_score: evidence,
    actionability_score: actionability,
    risk_score: risk,
    clarity_score: clarity,
    overall_score: Math.round((evidence + actionability + clarity + (100 - risk)) / 4),
    citation_coverage: Math.max(coverage, between(r, 68, 80)),
    flagged_claim_rate: claims.length ? Math.round((claims.filter((c) => c.is_flagged).length / claims.length) * 100) : 0,
    revision_count: between(r, 1, 6),
  };
}

function buildSolution(t: Topic) {
  const r = rng(`${t.id}:solution`);
  const owner = pick(r, OWNERS[t.slug]);
  const healthNote = t.slug === "health" ? " This is general information, not medical advice." : "";
  return {
    id: `${t.id}-solution`,
    title: `Action plan: ${t.title}`,
    summary: `Start with a small, measured pilot that answers one question: ${t.question} Grow it only if the results hold up.${healthNote}`,
    content: `The agents agreed on a pilot-first plan. ${t.hook} Pick 3 to 5 sites that look different from each other, track the same results in each, and review every quarter. Scale up only what clearly works, and stop what does not.${healthNote}`,
    intended_owner: owner,
    timeline: pick(r, TIMELINES),
    cost_band: pick(r, COST_BANDS),
    staffing_assumptions: `${between(r, 2, 6)} full-time staff per site, plus one shared data lead.`,
    dependencies: "Local partner agreements, a shared data system, and steady funding for at least one year.",
    risks_mitigations: "Funding cuts: lock in one-year commitments. Low uptake: work with trusted local groups. Weak data: set up tracking before launch.",
    success_metrics: [
      "Clear improvement on the main goal within 12 months",
      "Results hold across at least 3 different sites",
      "Cost per person stays within the planned range",
      "People served rate the program as helpful",
    ],
    is_published: true,
  };
}

function buildReplay(t: Topic) {
  return {
    id: `${t.id}-replay`,
    script: `Here's the 30-second version. The question: ${t.question} Why it matters: ${t.hook} The agents first agreed on what the real problem is. Then they argued over a pilot versus a big rollout. The Skeptic pushed on cost and what could go wrong. In the end, they landed on a pilot in a few different places, with clear results to track and a plan to grow only what works.`,
    duration_seconds: 30,
    timestamp_jumps: [
      { seconds: 0, label: "The question" },
      { seconds: 6, label: "Why it matters" },
      { seconds: 12, label: "The big debate" },
      { seconds: 18, label: "Risks" },
      { seconds: 24, label: "Decision" },
    ],
  };
}

export function getStaticMission(id: string, now = Date.now()) {
  const t = TOPIC_BY_ID.get(id);
  if (!t) return null;
  const live = isLiveNow(t, now);
  const { messages, claims } = buildDebate(t, now);
  const done = !live;
  return {
    id: t.id,
    title: t.title,
    core_question: t.question,
    constraints: CONSTRAINTS,
    success_metric: "Measurable improvement for the people affected within 12 months",
    debate_hook: t.hook,
    status: (live ? "live" : "completed") as "live" | "completed",
    is_live: live,
    started_at: messages[0]?.created_at ?? null,
    completed_at: done ? messages[messages.length - 1]?.created_at ?? null : null,
    bucket: { ...BUCKET_META[t.slug], slug: t.slug },
    messages,
    claims,
    score: buildScore(t, claims),
    solution: done ? buildSolution(t) : null,
    replay: buildReplay(t),
  };
}

export function getStaticMissionList(now = Date.now()) {
  return TOPICS.map((t) => {
    const { messages, claims } = buildDebate(t, now);
    const last = messages[messages.length - 1]?.created_at ?? null;
    const live = isLiveNow(t, now);
    const hourAgo = now - HOUR;
    return {
      id: t.id,
      title: t.title,
      core_question: t.question,
      status: (live ? "live" : "completed") as "live" | "completed",
      is_live: live,
      bucket: { slug: t.slug, name: BUCKET_META[t.slug].name },
      stats: {
        mission_id: t.id,
        last_message_at: last,
        messages_last_hour: messages.filter((m) => new Date(m.created_at).getTime() >= hourAgo).length,
        claims_count: claims.length,
        citation_coverage: buildScore(t, claims).citation_coverage,
        updated_at: last ?? new Date(now).toISOString(),
      },
    };
  }).sort((a, b) => Number(b.is_live) - Number(a.is_live));
}

export function getStaticRecentMessages(limit: number, now = Date.now()) {
  return TOPICS.filter((t) => isLiveNow(t, now))
    .flatMap((t) => buildDebate(t, now).messages.map((m) => ({ ...m, slug: t.slug })))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export function getStaticSystemStatus(now = Date.now()) {
  const list = getStaticMissionList(now);
  const tenMin = now - 10 * MINUTE;
  const messages10 = TOPICS.filter((t) => isLiveNow(t, now))
    .flatMap((t) => buildDebate(t, now).messages)
    .filter((m) => new Date(m.created_at).getTime() >= tenMin).length;
  return {
    debates_live: list.filter((m) => m.is_live).length,
    messages_last_10_min: messages10,
    citation_coverage_24h: Math.round(list.reduce((s, m) => s + m.stats.citation_coverage, 0) / list.length),
    generation_enabled: true,
    budget_state: "normal",
    last_updated: new Date(now).toISOString(),
  };
}

export function getStaticBriefs(now = Date.now(), days = 7) {
  const today = Math.floor(now / DAY) * DAY;
  const briefs = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(today - d * DAY).toISOString().slice(0, 10);
    for (const slug of Object.keys(MISSION_TOPICS)) {
      const r = rng(`${date}:${slug}`);
      const topics = TOPICS.filter((t) => t.slug === slug);
      const featured = [pick(r, topics), pick(r, topics)].filter((t, i, a) => a.indexOf(t) === i);
      briefs.push({
        id: `${date}-${slug}`,
        title: `${BUCKET_META[slug].name} brief: ${featured[0].title}`,
        content: featured
          .map((t) => `${t.title}\n${t.hook} The agents' take: start with a small pilot, track clear results, and grow only what works.`)
          .join("\n\n") + (slug === "health" ? "\n\nThis is general information, not medical advice." : ""),
        highlights: featured.map((t) => t.question),
        published_date: date,
        bucket_id: slug,
        bucket_slug: slug,
      });
    }
  }
  return briefs;
}
