---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/dashboard/page.tsx"]
---

# Surface brief: MentorMatch landing + app shell

Scope: landing (`/`, Persuade) is the first surface. The world carries into the app (dashboard, browse, roadmap, messages, sessions), which runs in Operate mode.
Audience: students and new grads aiming for a first role in their field (tech, business, aviation and more; not tech-only). Job: find a mentor who shares their skills and get a structured path.
Action: a working skill picker on the landing that returns real mentor matches (skill overlap) and leads into signup.
Proof: real mentors from the database and the real roadmap mechanism. No invented stats, testimonials or logos.

## Direction contract

THESIS: The mentor sets the route and the mentee climbs it. The page is a bouldering wall, and the roadmap is a graded, taped route with each milestone a hold. It refuses the category default of a split hero with a stock photo, a stat row, and a testimonial carousel.

OWN-WORLD: Dark textured wall panel (graphite #2f3237, bolt-hole dot grid) as ground. Chalk white (#f3f2ee) for type and laminated route cards. Grade tape colors as the only accents and state language: yellow #ffd23f, blue #3d7bff, pink #ff5fa2, green #34c77b. Archivo (wide/black for display, normal width for UI) plus Permanent Marker, used only on tape labels. Holds are resin blobs, controls are tape strips and route cards, and progress is ticks in chalk.

STORY: The visitor understands that MentorMatch pairs them by shared skills, then a mentor sets them a step-by-step route. They believe it because they see real mentors match their own skills live. They tap skills, see matches, and sign up.

FIRST VIEWPORT: Left 45%: wordmark, then a 2-line display headline "Your mentor sets the route." at ~104px, a one-sentence lede, and the start-hold skill picker (chips plus "Find my setters" button) as the primary action. Right 55%: the wall itself, with one taped route of 6 holds rising from bottom right to a "First offer" top tag, tape labels in marker face. Holds reveal labels on hover/focus.

FORM: Route Setter (bouldering route setting). It was #1 on the grounded list, chosen as the pick card. Seed key c6300b95.

SIGNATURE INTERACTION: On load and on scroll the route "is set": holds and tape appear bottom-up in sequence (reduced motion: static). Picking skills in the start hold re-ranks real mentor route cards live, each showing its shared skills.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
