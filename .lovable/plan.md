
# Home Hero Update - Clean Design with Functional CTAs

## Problem Summary
1. **Dead buttons**: "Watch Live" and "How It Works" buttons have no `onClick` or navigation
2. **Redundant branding**: Large hero logo duplicates the header logo
3. **Too much hero height**: Less content visible above the fold

## Solution Overview
Update `src/components/home/HeroStrip.tsx` to:
- Remove the hero logo image
- Replace content with the specified copy
- Add functional navigation to both CTAs
- Add trust chips row
- Reduce vertical padding for more content above the fold

---

## Changes to `src/components/home/HeroStrip.tsx`

### Remove
- Hero logo image (`heroLogoLight`, `heroLogoDark` imports and `<img>` element)
- `useTheme` hook (no longer needed for logo switching)
- `mounted` state (no longer needed)

### New Hero Content Structure

```
H1: "Two AIs debate. You get the playbook."
Subhead: "Live debates that publish practical, evidence-scored solutions with citations."
Micro-line: "Updated in real time as new claims appear."
CTAs: [Watch live] [How it works]
Trust chips: [Citations] [Evidence score] [Publishable summary]
```

### CTA Actions
- **Watch live**: Scroll to DebateWall section (smooth scroll to `#debate-wall`)
- **How it works**: Navigate to `/about` page

### Trust Chips
- Non-interactive display chips using Badge component with `outline` variant
- Three chips in a centered row with consistent Material 3 styling
- Add `aria-hidden="true"` and `tabIndex={-1}` to prevent focus

### Layout Changes
- Reduce padding from `py-10 md:py-14` to `py-6 md:py-10` for compact hero
- Maintain centered alignment
- Clear visual hierarchy: H1 (largest) > subhead > micro-line > CTAs > chips

---

## Add Scroll Target

Update `src/components/home/DebateWall.tsx`:
- Add `id="debate-wall"` to the section element for scroll targeting

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroStrip.tsx` | Complete rewrite with new copy, CTAs, trust chips |
| `src/components/home/DebateWall.tsx` | Add `id="debate-wall"` to section |

---

## Acceptance Checklist
- Only one visible brand lockup above the fold (header logo only)
- Hero shows new H1, subhead, micro-line, CTAs, and 3 trust chips
- "Watch live" scrolls to debate wall section
- "How it works" navigates to /about
- No regressions in layout, responsiveness, or accessibility
- More content visible above the fold (reduced hero height)
- Single H1 maintained for proper heading hierarchy
- No italics, no long dashes
- Dark mode styling preserved
- 16px+ font sizes maintained

---

## Technical Implementation

### HeroStrip.tsx Structure

```text
<section className="bg-gradient-to-b from-muted/50 to-background py-6 md:py-10">
  <div className="container text-center">
    {/* H1 - Main headline */}
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">
      Two AIs debate. You get the playbook.
    </h1>
    
    {/* Subhead */}
    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
      Live debates that publish practical, evidence-scored solutions with citations.
    </p>
    
    {/* Micro-line */}
    <p className="text-sm text-muted-foreground/70 mb-6">
      Updated in real time as new claims appear.
    </p>
    
    {/* CTAs */}
    <div className="flex items-center justify-center gap-4 mb-6">
      <Button size="lg" onClick={scrollToDebates}>
        <Play /> Watch live
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link to="/about">
          <HelpCircle /> How it works
        </Link>
      </Button>
    </div>
    
    {/* Trust chips */}
    <div className="flex items-center justify-center gap-2">
      <Badge variant="outline" aria-hidden="true">Citations</Badge>
      <Badge variant="outline" aria-hidden="true">Evidence score</Badge>
      <Badge variant="outline" aria-hidden="true">Publishable summary</Badge>
    </div>
  </div>
</section>
```

### Scroll Function

```typescript
const scrollToDebates = () => {
  const debateWall = document.getElementById('debate-wall');
  if (debateWall) {
    debateWall.scrollIntoView({ behavior: 'smooth' });
  }
};
```

---

## Visual Hierarchy (Typography)

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 | text-3xl/4xl/5xl | font-bold | foreground |
| Subhead | text-lg/xl | normal | muted-foreground |
| Micro-line | text-sm | normal | muted-foreground/70 |
| CTAs | default | font-medium | per variant |
| Chips | text-xs | font-semibold | outline variant |

---

## Spacing Rhythm

- H1 to subhead: mb-3
- Subhead to micro-line: mb-2
- Micro-line to CTAs: mb-6
- CTAs to chips: mb-6
- Section padding: py-6 md:py-10 (reduced from py-10 md:py-14)

This creates a compact, scannable hero that prioritizes the debate content below.
