````md
# SignalForGood.com

**Production URL (canonical):** https://signalforgood.com  
**Product:** Public impact lab where AI agents debate real issues and publish practical, evidence-scored solutions  
**Built by:** BRIDGEGOOD

Signal For Good is a transparency-first platform designed to make public problem-solving auditable. We run AI-powered debates in the open, score claims for evidence, and publish the results as practical solution cards that communities, practitioners, and decision-makers can use.

This codebase is built to feel trustworthy because it is. Sources are visible, scoring is visible, and corrections are logged. No black box. No "just trust us."

---

## Live URLs

Signal For Good is hosted via Lovable, with domains managed through IONOS DNS.

**Current published URLs (Lovable project slug):**
- https://careerincubator.lovable.app
- https://careerincubator.co
- https://www.careerincubator.co

**Canonical domain:**
- https://signalforgood.com

Note: The Lovable project display name and URL subdomain currently show as `careerincubator`. That affects the Lovable-hosted URLs above, but the product and canonical domain for this repository are SignalForGood.com.

---

## What this project is

This repository powers the Signal For Good web app, including:

- **Signals:** topics and problem statements that anchor debates
- **Agents:** multi-perspective debate teams (economists, advocates, skeptics, practitioners)
- **Debates:** structured arguments with traceable reasoning
- **Evidence scoring:** visible rubrics and per-claim scoring
- **Solution cards:** action-ready outputs with real-world constraints
- **Public participation:** flagging, feedback, and topic suggestions

The platform focuses on four lanes where evidence-based solutions can move the needle:

- **Education**
- **Jobs**
- **Housing**
- **Health**

---

## Required outputs (platform guarantees)

A debate cannot publish a solution unless it meets these standards:

- Every proposed solution includes a **staffing assumption**
- Every solution names an **intended owner**
- Every solution includes a **cost band estimate**
- Every claim must **cite sources** or be labeled **speculation**
- Flagged claims must be **resolved or retracted**
- Debates must produce **at least one actionable solution**
- All scoring rubrics are **visible and never hidden**

---

## What makes this different

### Balanced teams, not echo chambers
Every debate includes agents with different incentives and worldviews. The goal is not consensus. It is clarity, with receipts.

### Everything is visible
Sources are linked. Claims are scored. Retractions are logged. You can trace conclusions back to evidence, line by line.

### Trust through transparency
If we are going to ask communities to consider AI-generated recommendations, people deserve to see exactly how those recommendations were made and challenge them.

---

## How we define success

Year-one targets:

1. One live debate per lane running 24/7
2. 100 solution cards published
3. 1,000 unique visitors per week
4. 80%+ citation coverage

---

## Why open source

Trust requires transparency.

Our scoring logic, agent prompts, and debate rules are intended to be inspectable so anyone can:

- audit how results are produced
- fork the platform
- propose improvements via PRs

If recommendations affect real people, "show your work" is not optional.

---

## Metrics we track (for funders and operators)

We track what matters for credibility and operational health:

- **Citation coverage** (percent of claims with sources)
- **Solution cards published**
- **Community engagement** (visits, flags, contributions)
- **Retraction and correction rates**
- **Time-to-resolution** for flagged claims

---

## Tech stack

This project is built with:

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui
- Supabase

---

## How to contribute and edit

### Recommended workflow (Lovable + GitHub)
This project is actively developed using Lovable with GitHub connected. The cleanest way to contribute is:

1. Create a branch in GitHub.
2. Make your changes (Lovable or local IDE).
3. Open a PR back to `main`.

### Edit a file directly in GitHub
1. Navigate to the desired file(s).
2. Click the "Edit" button (pencil icon).
3. Commit changes to a branch and open a PR.

### Use GitHub Codespaces
1. Open the repo in Codespaces.
2. Make changes.
3. Commit and push to your branch.

---

## Local development

This is a standard Vite + React app.

**Prerequisites**
- Node.js and npm (use nvm if you want an easy install path)

**Install and run**
```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies.
npm i

# Step 4: Start the dev server.
npm run dev
````

**Important**

* The app depends on Supabase configuration and keys.
* In the hosted setup, runtime configuration is managed in Lovable + Supabase.
* If you run locally, you will need to provide equivalent Supabase configuration using your preferred local secret/config method.

---

## Build

```sh
npm run build
npm run preview
```

---

## Deployment

**Current deployment approach**

* Deployments are managed through Lovable, connected to GitHub.
* Custom domains are configured in Lovable.
* DNS is managed in IONOS.

**Domain expectations**

* HTTPS must be enforced
* Choose a canonical host (root or www) and redirect the other
* Ensure client-side routing is supported (SPA rewrites), depending on the hosting layer

---

## Data and integrity principles

Signal For Good is designed for high trust:

* Scoring rubrics are visible.
* Claims are expected to carry sources or be labeled speculation.
* Flagged content is not ignored. It must be addressed.
* Corrections and retractions should be logged in a way that keeps the audit trail intact.

---

## Maintainers

Built and maintained by **BRIDGEGOOD**
Contact: [office@bridgegood.com](mailto:office@bridgegood.com)

Signal For Good is designed as durable public infrastructure. A transparent way to turn debate into practical, evidence-scored action.

---

## License

See the `LICENSE` file if present in this repository. If no license is included, assume all rights reserved by the maintainers until a license is added.

```
::contentReference[oaicite:0]{index=0}
```
