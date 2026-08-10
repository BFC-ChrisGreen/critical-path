---
name: Critical Path
description: A playful project-management career sim that teaches real PM skills through weekly decisions
colors:
  bg: "oklch(97% 0.008 55)"
  surface: "oklch(99% 0.004 55)"
  surface-2: "oklch(94% 0.012 55)"
  surface-3: "oklch(90.5% 0.015 55)"
  border: "oklch(87% 0.015 55)"
  border-strong: "oklch(78% 0.02 55)"
  text: "oklch(23% 0.018 55)"
  text-dim: "oklch(43% 0.02 55)"
  text-faint: "oklch(58% 0.016 55)"
  accent: "oklch(66% 0.19 42)"
  accent-strong: "oklch(56% 0.19 40)"
  accent-soft: "oklch(92% 0.05 42)"
  good: "oklch(60% 0.15 155)"
  good-soft: "oklch(93% 0.045 155)"
  risk: "oklch(57% 0.19 25)"
  risk-soft: "oklch(93.5% 0.05 25)"
  warn: "oklch(68% 0.15 80)"
  warn-soft: "oklch(93.5% 0.05 80)"
  info: "oklch(60% 0.14 275)"
  info-soft: "oklch(93% 0.035 275)"
typography:
  display:
    fontFamily: "Charter, 'Iowan Old Style', Georgia, 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'SFMono-Regular', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.72rem"
    fontWeight: 650
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "9px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "0.4rem"
  sm: "0.6rem"
  md: "0.9rem"
  lg: "1.4rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-soft}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.1rem"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "1.4rem 1.5rem"
  pill-good:
    backgroundColor: "{colors.good-soft}"
    textColor: "{colors.good}"
    rounded: "{rounded.pill}"
  pill-risk:
    backgroundColor: "{colors.risk-soft}"
    textColor: "{colors.risk}"
    rounded: "{rounded.pill}"
---

# Design System: Critical Path

## 1. Overview

**Creative North Star: "The Sprint Room"**

Critical Path is a career sim, not an admin console: the player is a project manager making
real decisions under real pressure, and the interface should feel like the inside of a
well-run sprint room rather than a filing cabinet. Warmth comes from a single confident
tangerine accent against tinted-paper neutrals; energy comes from motion that responds to
what the player just did (a bar filling, a tab sliding in, a card lifting under the cursor),
never from decoration for its own sake. This is explicitly not a SaaS dashboard: no
corporate blue-and-white, no flat grey card grid, no interface that could be mistaken for an
internal admin tool. The personality lives in color, rhythm, and copy, not in gimmicks that
would undercut the game's credibility as an actual PM-teaching tool.

**Key Characteristics:**
- One committed accent color (tangerine) carrying primary actions and identity, not spread
  thin as decoration
- A five-color semantic vocabulary (accent, good, risk, warn, info) that stays consistent
  everywhere status is shown: pills, bars, table cells, Gantt bars, Kanban cards
- Warm-tinted neutrals throughout, never pure black or white
- The primary action on any screen is always reachable without scrolling

## 2. Colors

Tinted-neutral base (a warm paper tone, not grey) with one committed accent and a four-color
semantic system layered on top for game state.

### Primary
- **Momentum Tangerine** (`oklch(66% 0.19 42)`, `--accent`): primary buttons, active tab
  underline, focus rings, selected cards, brand wordmark. This is the one color that says
  "act here."

### Secondary
- **Delivered Green** (`oklch(60% 0.15 155)`, `--good`): completed tasks, passed milestones,
  on-track dashboard status, positive stakeholder trust.
- **Blocked Red** (`oklch(57% 0.19 25)`, `--risk`): triggered risks, critical-path highlights,
  budget-exhausted states, low stakeholder trust.
- **Watch Amber** (`oklch(68% 0.15 80)`, `--warn`): unmitigated risks, at-risk dashboard
  status, due-this-week milestones.
- **In-Progress Violet** (`oklch(60% 0.14 275)`, `--info`): the one non-accent hue reserved
  for narrative log entries ("review") to keep the event/system/review distinction legible
  without reusing accent or risk for something that isn't an action or a danger.

### Neutral
- **Paper** (`oklch(97% 0.008 55)`, `--bg`): page background.
- **Card** (`oklch(99% 0.004 55)`, `--surface`): panels, modals.
- **Recessed Card** (`oklch(94% 0.012 55)`, `--surface-2`): nested surfaces (task columns,
  stat tiles, candidate cards).
- **Ink** (`oklch(23% 0.018 55)`, `--text`) down to **Faint Ink** (`oklch(58% 0.016 55)`,
  `--text-faint`): three-step text hierarchy for primary copy, secondary copy, and metadata.

### Named Rules
**The One Accent Rule.** Tangerine means "act here" and nothing else. It never appears as
mere decoration; if a tangerine element isn't clickable or currently selected, it's the
wrong color.

**The Status-Never-Alone Rule.** Color never carries status by itself. Every good/warn/risk
signal pairs with a text label or Pill, never a bare colored dot or border.

## 3. Typography

**Display Font:** Charter, with Iowan Old Style, Georgia, Times New Roman as fallbacks
**Body Font:** -apple-system / Segoe UI / Roboto system stack
**Label/Mono Font:** SFMono-Regular / JetBrains Mono / ui-monospace

**Character:** A warm editorial serif for headings against a plain native sans for
everything else. The serif signals "this is a story with stakes" (your project, going right
or wrong); the sans keeps dense UI (tables, stat tiles, forms) fast to scan.

### Hierarchy
- **Display / h1** (700, 2rem, 1.12 line-height, -0.01em tracking): screen titles only, one
  per screen.
- **Headline / h2** (700, 1.4rem, 1.2 line-height): panel-level section breaks, used sparingly.
- **Title / h3** (700, 1.2rem, 1.25 line-height): modal titles, card headers.
- **Body** (400, 1rem, 1.55 line-height): prose copy, capped at 60-64ch via `.page-lede`.
- **Label** (650, 0.72rem, uppercase, 0.1em tracking, mono): eyebrows, table headers, stat
  tile labels, pill text. The mono label is the app's signature texture, used wherever the
  UI needs to feel instrumented rather than editorial.

### Named Rules
**The Two-Voice Rule.** Only two families exist: serif for headings, sans/mono for
everything else. No third display face, ever.

## 4. Elevation

Mostly flat with tonal layering (background → surface → surface-2 → surface-3), not shadow
stacks. Shadow exists only at two strengths and only where something is genuinely floating
above the page: `--shadow-sm` for resting panels and buttons (a whisper, not a drop shadow),
`--shadow-md` for the event modal and hover states that lift off the page, and
`--shadow-action` (an upward shadow) purely to separate the sticky bottom action bar from
scrolling content beneath it.

### Shadow Vocabulary
- **Whisper** (`--shadow-sm`, `0 1px 2px oklch(30% 0.02 55 / 0.08)`): default panel and
  button resting state.
- **Lift** (`--shadow-md`, `0 6px 20px oklch(30% 0.02 55 / 0.12)`): modal, primary button
  hover.
- **Floor Shadow** (`--shadow-action`, `0 -4px 16px oklch(30% 0.02 55 / 0.1)`): the sticky
  action bar, shadow cast upward to read as "in front of" scrolling content.

### Named Rules
**The Tonal-First Rule.** Reach for a darker/lighter surface step before reaching for a
shadow. Shadows are reserved for things that float (modals, sticky bars), not for routine
panel separation.

## 5. Components

### Buttons
- **Shape:** 8px radius (`--rounded: 8px` equivalent), never pill-shaped except status Pills.
- **Primary:** solid `--accent` fill, `--accent-ink` text, `--shadow-sm` at rest, darkens to
  `--accent-strong` with `--shadow-md` on hover, presses down 1px on active.
- **Secondary:** `--surface-2` fill, `--border-strong` outline, border brightens to accent on
  hover. Used for every non-primary action (Release, Unassign, stepper buttons).
- **Hover / Focus:** all interactive elements get a 2px accent outline on `:focus-visible`;
  hover transitions run 150ms on the shared `--ease-out` curve.

### Chips / Pills
- **Style:** fully rounded (999px), monospace uppercase label, a leading colored dot, soft
  background tinted to match the semantic color (good/warn/risk/info soft tokens).
- **State:** status-only, never interactive. Pills report; buttons act.

### Cards / Containers
- **Corner Style:** 9-12px radius depending on nesting depth (panels 12px, nested cards 9px).
- **Background:** `--surface` for top-level panels, `--surface-2` for anything nested one
  level in (task columns, stat tiles, SWOT quadrants, candidate cards).
- **Shadow Strategy:** `--shadow-sm` on panels; nested cards are flat, differentiated by
  background tone alone (see Elevation).
- **Border:** 1px `--border` on top-level panels only; nested cards rely on background
  contrast instead of a border.

### Inputs / Fields
- **Style:** 1px `--border` stroke, `--surface-2` background, 6-7px radius.
- **Focus:** shared `:focus-visible` accent outline, no separate glow treatment.

### Navigation
- **Top bar:** sticky, blurred translucent background so it stays legible over scrolling
  content, serif wordmark with the accent color on the second word ("Critical **Path**").
- **Tabs** (Weekbeat): flat text tabs with a 2px accent underline on the active tab, not a
  filled pill. Switching tabs triggers a 180ms fade-and-rise entrance on the panel content.

### Action Bar (signature component)
The sticky bottom bar is the app's answer to "the primary action must never require
scrolling." It pins to the viewport bottom with a blurred translucent background and an
upward Floor Shadow, holding exactly one primary button plus one line of contextual meta
text (week counter, points remaining, hire count). Every screen with a primary
call-to-action uses it: character creation, the terminology quiz, kickoff, the weekly loop,
and the debrief screen all share this exact pattern.

## 6. Do's and Don'ts

### Do:
- **Do** keep tangerine to primary actions and current selection only (The One Accent Rule).
- **Do** put every screen's primary call-to-action in the sticky `.action-bar`, never at the
  natural end of a long scroll.
- **Do** pair every color-coded status with a text label (The Status-Never-Alone Rule).
- **Do** use tonal surface steps (`--surface` → `--surface-2` → `--surface-3`) before reaching
  for a border or shadow to separate content.
- **Do** keep transitions in the 150-250ms range on `--ease-out`; motion should feel like
  acknowledgment, not choreography.

### Don't:
- **Don't** use `border-left` or `border-right` as a colored accent stripe on cards, list
  entries, or callouts. Use a full border color change, a background tint, or a text
  label/tag instead.
- **Don't** build anything that reads as a generic SaaS dashboard: no card-grid-of-metrics
  layout, no corporate blue-and-white palette, no interface indistinguishable from an
  internal admin tool (per PRODUCT.md's anti-references).
- **Don't** introduce a third font family. Headings are always the serif; everything else is
  always the sans/mono pair.
- **Don't** use gradient text or glassmorphism as a default decorative choice.
- **Don't** animate layout-affecting CSS properties (width/height changes on hover, for
  example); animate opacity, transform, and box-shadow instead.
- **Don't** rely on a bare colored dot or icon for status. Every Pill carries a text label.
