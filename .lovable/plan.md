

# Add GitHub Link Sitewide

The real repo URL `https://github.com/shauntai/signalforgood/` needs to be wired into all pages that reference GitHub or open source.

## Changes

### 1. `src/pages/OpenSource.tsx`
- Replace the 3 placeholder repository URLs (`url: "#"`) with the single real repo URL `https://github.com/shauntai/signalforgood/`
- Since there's one monorepo (not 3 separate repos), consolidate the repositories list to point to the same URL, or simplify to a single repo card pointing to the real link
- Wire the "Start contributing" button to link to `https://github.com/shauntai/signalforgood/`

### 2. `src/pages/Agents.tsx`
- Wire the "View prompts on GitHub" button (line 251) to link to `https://github.com/shauntai/signalforgood/`

### 3. `src/pages/About.tsx`
- In the "Why open source" section (line 208-226), add a GitHub link button so users can go straight to the repo

### 4. `src/components/layout/Footer.tsx`
- Add a GitHub icon link in the footer pointing to the repo, giving sitewide visibility

