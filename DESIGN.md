---
name: MentorMatch
description: Mentorship with a route, in any field. The mentor sets the route; the mentee climbs it.
colors:
  wall: "#2b2e33"
  wall-deep: "#1f2125"
  wall-edge: "#3a3e45"
  panel: "#e3e5e4"
  panel-deep: "#d5d8d7"
  card: "#fbfbfa"
  chalk: "#f4f5f2"
  ink: "#17191c"
  ink-soft: "#4b5058"
  ink-faint: "#6b7079"
  border: "#d0d4d3"
  input-stroke: "#c4c8c9"
  tape-yellow: "#ffd23f"
  tape-yellow-hover: "#ffdb63"
  tape-yellow-deep: "#e6b60f"
  tape-blue: "#2f64e6"
  tape-blue-soft: "#dfe7fd"
  tape-green: "#2fb872"
  tape-green-soft: "#daf4e6"
  tape-red: "#d6392b"
  tape-red-soft: "#fde3e0"
  tape-red-text: "#8c2319"
  tape-pink: "#ff5fa2"
  tape-pink-soft: "#ffe1ee"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.1vw, 5.4rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.6vw, 3.75rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 112"
  page-title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.9rem)"
    fontWeight: 850
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'ss01'"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  chip:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  tape:
    fontFamily: "Permanent Marker, Marker Felt, cursive"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.15
rounded:
  sm: "6px"
  md: "10px"
  block: "12px"
  lg: "14px"
  xl: "18px"
  pill: "9999px"
spacing:
  gutter-mobile: "16px"
  gutter: "32px"
  card-pad: "24px"
  card-pad-lg: "32px"
  section-y: "80px"
  section-y-lg: "112px"
  bolt-grid: "52px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-tape:
    backgroundColor: "{colors.tape-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-tape-hover:
    backgroundColor: "{colors.tape-yellow-hover}"
  button-tape-hero:
    backgroundColor: "{colors.tape-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-destructive:
    backgroundColor: "{colors.tape-red}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 14px"
    height: "44px"
  route-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  dialog:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  skill-chip:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  skill-chip-selected:
    backgroundColor: "{colors.tape-yellow}"
    textColor: "{colors.ink}"
  skill-pill:
    backgroundColor: "#e9ebea"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  skill-pill-shared:
    backgroundColor: "{colors.tape-yellow}"
    textColor: "{colors.ink}"
  nav-item:
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.tape-yellow}"
    textColor: "{colors.ink}"
  tape-label:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    typography: "{typography.tape}"
    padding: "0.28em 0.75em 0.32em"
  error-note:
    backgroundColor: "{colors.tape-red-soft}"
    textColor: "{colors.tape-red-text}"
    rounded: "{rounded.block}"
    padding: "12px 16px"
---

# Design System: MentorMatch

## Overview

**Creative North Star: "The Route Setter"**

The mentor sets the route and the mentee climbs it. The system is a bouldering gym: a graphite plywood wall drilled with a T-nut bolt grid, resin holds bolted to it, laminated route cards hung beside it, and strips of grade tape that name every route and every state. A roadmap is a graded, taped route; a milestone is a hold; progress is a chalk tick.

The world has two grounds, chosen by what the surface is for. Persuade surfaces (the landing, the auth aside, the route heroes at the top of dashboard and roadmap screens, the app sidebar) stand on the graphite wall. Operate surfaces (dashboard body, browse, routes, messages, profile, every form) sit on the light panel with laminated route cards on top. This split comes from product truth rather than the metaphor: mentees and mentors use MentorMatch for dense, repeated working sessions (tasks, roadmaps, messages, long forms) and the product targets WCAG 2.1 AA. Long reading and form entry on a light ground keep body ink at high contrast (13.9:1 on the panel), while the wall is reserved for the moments that carry identity.

Accent is scarce and semantic. The grade-tape colours are the only accents and each one means something. Type is one variable family, Archivo, pushed wide and black for display and held at normal width for UI, with Permanent Marker appearing only where a setter would write by hand: on tape.

**Key Characteristics:**
- Graphite wall (bolt-hole dot grid, 52px pitch) for identity moments; light dotted panel for working screens.
- Laminated route cards (#fbfbfa, 14px corners, soft card shadow) carry all operate-mode content.
- Grade-tape colours as the only accents, each bound to one meaning.
- Archivo wide-black display (wdth 112, weight 850) against plain Archivo UI; marker face only on tape.
- Holds as the unit of progress: reached holds ticked in chalk, holds ahead drawn as ghosts.
- One authored motion moment: the route is set bottom-up on the landing.

## Colors

A cool graphite-and-chalk climbing gym, lit only by grade tape.

### Primary
- **Grade Tape Yellow** (tape-yellow): the primary action colour. Primary CTAs ("Find my mentors", "Get started", the tape button variant), the active nav item, selected skill chips, shared-skill pills, the "Top" tag on a route, brand holds (the wordmark hold, landing route holds), and text selection. Hover lifts to tape-yellow-hover. Ink text on yellow reads at 12.2:1.

### Secondary
- **Grade Tape Blue** (tape-blue): "current" and nothing else. The current hold's row tint (tape-blue-soft), the focus ring on every control, and the input caret. White on blue reads at 5.1:1.

### Tertiary
- **Grade Tape Green** (tape-green): reached / done. Completed states and their soft fill (tape-green-soft).
- **Grade Tape Red** (tape-red): errors and destructive actions only. The destructive button, invalid field borders, the ErrorNote fill (tape-red-soft with tape-red-text, 7.3:1). Inline field errors use red-700 (#b02c20) on card.
- **Resin Pink** (tape-pink): an identity colour without state meaning. It appears as hold resin in decorative hold clusters and as one of the four avatar initial tones. It never signals success, failure, current or action.

### Neutral
- **Graphite Wall** (wall): the Persuade ground and the app sidebar / mobile header. Chalk text on it reads at 12.5:1.
- **Deep Wall** (wall-deep): banded sections on the landing (at 60%), dialog and drawer scrims (at 70%).
- **Wall Edge** (wall-edge): scrollbar thumbs and seams on the wall.
- **Light Panel** (panel): the Operate ground and the `body` background, with a faint 52px dot grid.
- **Laminate** (card): route cards, inputs, dialogs, popovers.
- **Chalk** (chalk): type on the wall, chalk tape labels, chalk ticks, primary-button text.
- **Ink** (ink): body text, primary buttons, hyperlinks. **Ink Soft** (ink-soft): secondary text and ledes (6.4:1 on panel). **Ink Faint** (ink-faint): placeholders and tertiary metadata on laminate only (4.8:1 on card; it drops to 3.9:1 on the panel, so it does not go on bare panel).
- **Border** (border) and **Input Stroke** (input-stroke): hairlines and field outlines.

### Named Rules
**The Tape Means Something Rule.** Every accent is a grade-tape colour with one job: yellow = primary action, active nav, brand holds; blue = current (current hold, focus ring); green = reached / done; red = error / destructive. Pink is resin, never state. If a colour is not doing one of those jobs, it is ink, chalk or a neutral.

**The Ground By Mode Rule.** Persuade surfaces stand on the graphite wall; Operate surfaces sit on the light panel with laminated route cards. A working screen gets at most one wall band (a route hero) above its panel body.

**The Ink Link Rule.** Hyperlinks are ink with a 2px underline at 30% ink, darkening to full ink on hover. Links are never tape blue; blue already means "current".

**The Inherited Palette Rule.** The legacy names (gray, blue, green, yellow, red, brand-*) and the shadcn semantic tokens are remapped onto this world in the theme so older screens inherit it. New code uses the world names (wall, panel, card, chalk, ink, tape-*).

## Typography

**Display Font:** Archivo variable (width axis), self-hosted via next/font, with ui-sans-serif / system-ui fallback
**Body Font:** Archivo at normal width, stylistic set ss01
**Label/Mono Font:** Permanent Marker, only on tape; ui-monospace for code

**Character:** One family doing two jobs. Pushed to 112% width and weight 850, Archivo becomes route-setter signage; at normal width it is a calm, legible UI face. The marker face is a setter's hand, and it appears only where a hand would write.

### Hierarchy
- **Display** (850, clamp 2.6rem to 5.4rem, 0.92): the landing hero headline only, chalk on the wall.
- **Headline** (850, clamp 2.2rem to 3.75rem, 0.92): landing section headings and the auth wall line.
- **Page Title** (850, clamp 2rem to 2.9rem, 1.0, -0.03em): every app screen's h1, set globally for `#main h1`, and auth form titles.
- **Title** (700, 18px to 20px, tight tracking): panel headings, mentor names, card titles.
- **Lede** (400, 17px, relaxed): the sentence under a page title, max 60ch, ink-soft.
- **Body** (400, 15px to 16px, 1.6): running text, max 32ch to 60ch depending on the block.
- **Label** (600, 14px): buttons and field labels.
- **Chip** (600, 13px): skill chips, holds on route tags, status pills.
- **Tape** (Permanent Marker 400, 15px to 24px, 1.15): grade-tape labels and the "Top" tag only. Grade markers inside tape (Start, V1) drop back to Archivo bold 12px, tape-yellow on an ink slug.

### Named Rules
**The Marker Only On Tape Rule.** Permanent Marker appears inside a tape strip and nowhere else: not headings, not buttons, not body.

**The No Eyebrow Rule.** Headings stand alone; there is no small label above them. Attribution ("Set by your mentor", setter / mentee names) rides on chalk or yellow tape tags beside the content.

**The Tabular Numbers Rule.** Dates, times, table cells and scores use tabular numerals.

## Layout

The wall is a 52px bolt grid (dots offset 26px), and that pitch is the world's underlying rhythm. App screens use a 256px wall sidebar on desktop (a 288px drawer plus a 56px wall header below the lg breakpoint) and a panel main column capped at 1240px with 16px / 32px gutters and 24px / 40px vertical padding. Landing sections cap at 1400px with 80px / 112px vertical rhythm; the first viewport is a two-column split (about 1.12fr text to 0.88fr wall) that collapses to one column below lg. Auth screens split 0.85fr wall aside to 1fr panel, with the form card capped at 460px.

Content blocks are route cards with 20px / 24px padding (32px for featured cards), stacked in grids with 20px gaps. Page titles sit 32px above content. Line lengths are held explicitly: display 11ch to 18ch, ledes 34ch to 60ch, card body 32ch to 46ch.

## Elevation & Depth

Depth is physical and quiet. Route cards are laminated sheets with a 1px ink-8% hairline and a soft drop; dialogs and drawers lift further. Holds carry their own SVG drop shadow (they are bolted on, so they cast). Tape has a 2px inset darkening along its bottom edge, and tape-yellow buttons repeat that inset, as if the button were a strip of tape. There are no hard offset shadows.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 0 rgb(23 25 28 / 0.04), 0 8px 24px -12px rgb(23 25 28 / 0.22)`): every route card and Card.
- **Lift** (`box-shadow: 0 2px 0 rgb(23 25 28 / 0.05), 0 18px 40px -18px rgb(23 25 28 / 0.38)`): dialogs and the mobile nav drawer.
- **Tape inset** (`box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.08)`; buttons use 0.12, hero CTA -3px at 0.14): tape strips and tape-yellow buttons.

### Named Rules
**The Laminate Rule.** Content never floats free on the panel; it sits on a route card with the card shadow. Lift is for things that cover other things.

## Shapes

Corners scale with the size of the object: controls (buttons, inputs, selects, nav items) at 10px (md), in-card blocks (empty states, skeletons, error notes, select popovers) at 12px, route cards at 14px (lg), dialogs at 18px (xl). Skill chips, skill pills, field tabs, badges and avatars are full pills / circles. Grade markers are near-square ink slugs (3px to 4px). Tape is the one irregular form: a torn-edge clip-path polygon, set at a slight rotation (about 2 to 3 degrees). Holds are five organic resin silhouettes (crimp, jug, sloper, pinch, pocket) with a bolt at the centre. Empty states use a 2px dashed ink-12% outline, and dashed lines mean "not yet" everywhere: holds ahead, route links ahead, upcoming steps.

## Components

### Buttons
Tactile and plain: a pressed control, not a glossy one.
- **Shape:** gently rounded (10px), 40px high (32px small, 48px large, 52px hero CTA).
- **Primary (default):** ink fill, chalk text, 600 weight. The workhorse on light panels.
- **Tape:** tape-yellow fill, ink text, inset bottom edge. The one primary action per view, and the main CTA on the wall.
- **Destructive:** tape-red fill, white text.
- **Outline / Secondary / Ghost:** laminate with 15% ink stroke; gray-100 fill; transparent with ink-soft text.
- **Hover / Focus / Active:** colour shifts over 200ms on the expo ease-out; a 3px tape-blue focus ring with 2px offset; active presses down 1px; disabled at 45% opacity.

### Chips
- **Skill chip (on the wall):** 40px pill, 25% chalk outline, chalk text. Selected: tape-yellow fill, ink text, a check icon, `aria-pressed`.
- **Skill pill (on cards):** small pill, gray-100 with ink-soft text; a shared skill turns tape-yellow with ink text and a screen-reader "(shared)" suffix.
- **Field tabs (on the wall):** 36px pills; selected is chalk fill with ink text.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** laminate (card).
- **Shadow Strategy:** Card shadow (see Elevation).
- **Border:** 1px ink at 8%.
- **Internal Padding:** 20px to 24px; 32px on featured or auth cards. Example route cards on the wall sit rotated about 1.2 degrees, like a sheet pinned up.

### Inputs / Fields
- **Style:** laminate fill, 1px input-stroke outline, 10px corners, 44px high, 14px horizontal padding, 15px to 16px ink text, ink-faint placeholder.
- **Focus:** border turns tape-blue with a 3px 25% tape-blue ring; caret is tape-blue.
- **Error / Disabled:** border turns tape-red; the message sits below in red-700, `role="alert"`. Disabled at 50% opacity. Labels sit above in 14px semibold ink.

### Navigation
- **App sidebar:** a 256px graphite wall column with the chalk wordmark. Items are 15px medium, chalk at 70%, 10px corners, lucide icons at 18px; hover adds a 6% white wash; the active item is tape-yellow with ink text and `aria-current="page"`. The profile block sits at the foot above a white-8% seam. Below lg it becomes a 56px wall header and a 288px drawer over a 70% wall-deep scrim.

### Grade Tape (signature)
A strip of tape with torn ends, set in Permanent Marker. Variants: yellow (default, the "Top" tag and "Set by your mentor"), chalk (route labels on the wall), green, pink, and blue with white text. Grade markers inside a strip are ink slugs with tape-yellow Archivo bold text.

### Holds and Routes (signature)
A hold is a resin blob with a radial highlight, a centre bolt and a cast shadow, in one of four resins (yellow, blue, pink, green). A route is one identity: all its holds share one resin colour, with chalk tape labels, graded Start, V1, V2 and so on, topped by a "Top" tag on yellow tape. Reached holds carry a hand-drawn chalk tick (kept upright regardless of hold rotation); the current hold is full colour and drawn 1.25 times larger; holds ahead are ghosts: grayscale at 30% opacity on the panel, 45% with lifted brightness on the wall. Links between reached holds are solid; links ahead are dashed. Every route exposes a text equivalent ("3 of 5 milestones reached", per-hold "reached / current / ahead").

### Person
A photo, or the person's initials on a tape colour picked deterministically from their name (yellow, blue, pink or green), in circles from 28px to 96px.

### Motion
One authored moment: on the landing, the route is set bottom-up. Holds rise 18px and scale from 0.9 over 700ms, staggered 140ms, while the route line fades in over 1600ms, all on the expo ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`). Everything else is short state transitions (200ms to 300ms) on the same curve. `prefers-reduced-motion` collapses every animation and transition globally.

## Do's and Don'ts

### Do:
- **Do** put identity moments (landing, auth aside, route heroes, sidebar) on the graphite wall and working screens on the light panel with route cards.
- **Do** keep tape-yellow for the primary action, active nav, selected / shared skills and brand holds; use tape-blue only for "current" and focus.
- **Do** draw a route in one resin colour, grade it Start, V1, V2..., tick reached holds in chalk and ghost the holds ahead.
- **Do** set every app h1 in the display voice (Archivo 850, wdth 112) and keep body text ink or ink-soft on laminate or panel.
- **Do** style hyperlinks as ink with a 2px underline at 30% ink.
- **Do** use the world token names (wall, panel, card, chalk, ink, tape-*) in new code.
- **Do** give every route and hold a text equivalent, and keep the 3px tape-blue focus ring visible.

### Don't:
- **Don't** use a grade-tape colour as decoration without its meaning, and don't give pink a state meaning.
- **Don't** colour hyperlinks tape blue.
- **Don't** set Permanent Marker outside a tape strip.
- **Don't** put an eyebrow or kicker label above a heading; attribution goes on a tape tag.
- **Don't** mix resin colours within a single route.
- **Don't** put ink-faint text on the bare panel; it is for laminate only.
- **Don't** add a second authored animation; state changes stay short and on the expo ease-out.
