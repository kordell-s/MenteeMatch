# MentorMatch for NCBA: B2B demo design

Date: 2026-10-12
Status: approved in conversation, awaiting written-spec review
Scope: a clickable demo, not a production feature

## 1. Purpose

Show the National Commercial Bank of Anguilla (NCBA) what an internal-mobility version of MentorMatch would do for them, in a live, clickable demo of about four minutes.

The pitch in one sentence: **the bank sees where its skill gaps are, and every gap is closed by a colleague who has already made the move, who then verifies the skill so the map stays honest.**

## 2. Product truth carried into the demo

These come from the B2B design conversation and the demo must not contradict them:

- **Buyer:** HR / Learning and Development, for internal use.
- **First program:** internal mobility and upskilling (employees moving from one role to another).
- **Route ownership:** the company sets the wall (target roles and the skills each needs, at levels 1 to 3). A mentor who has made the move sets the personal route on top of it.
- **Headline outcome:** skill-gap visibility.
- **Verification rule:** only mentor-verified skills count fully. Self-declared skills appear hatched. A mentor may only verify a skill they hold at an equal or higher level.
- **Managers** are notified when someone on their team starts a climb. They are never asked to approve it.
- **Mechanism:** the existing skill-overlap math, pointed at roles. Gap = role skills minus the person's skills, weighted by level difference.

## 3. Framing and truthfulness

- MentorMatch branding throughout. An opening title card reads "Prepared for National Commercial Bank of Anguilla".
- NCBA appears by name in text only. No NCBA logo, colours or brand marks.
- A permanent "Synthetic demo data" tag is visible on every screen.
- Every person is invented. Headcount is shown as "about 180 staff (illustrative)". No figure is presented as NCBA's real data.
- No claims about NCBA's current programs, systems or staff.

## 4. Form

- A route in this repo at `/demo/ncba`, built from existing world components: `Hold`, `RouteStrip`, `Person`, `.tape`, `.route-card`, `.wall`, `.panel`.
- All demo state is held in the browser (React state seeded from a fixture file). There is no database, no API call and no login.
- The route is excluded from the auth middleware and from the main navigation. It is reachable only by URL.
- A persistent bar at the top shows "Viewing as: L&D admin · Employee · Mentor" (a three-way switcher) plus a "Reset demo" button that restores the fixture.
- Desktop first (1280 to 1600 wide, for presenting). It must remain usable at tablet width. Phone layout is not required.
- Visual world: the Route Setter system in DESIGN.md. The wall material frames hero moments (title card, the mentor's route). The light panel carries the dense gap map, which is an Operate screen.

## 5. Demo data (fixture)

File: `app/demo/ncba/fixture.ts`. Typed, deterministic, no randomness.

### 5.1 Skills (18, levels 1 to 3)

Credit analysis, Financial statements, Excel modelling, Risk rating, Report writing, Client relationships, Product knowledge, Sales conversations, AML/KYC, Regulatory reporting, Investigations, Policy writing, Risk frameworks, Data analysis, Digital channels, Product ownership, Vendor management, Presentation.

### 5.2 Roles (the wall)

| Role | Required skills (target level) |
|---|---|
| Credit Analyst | Credit analysis 2, Financial statements 2, Excel modelling 2, Risk rating 1, Report writing 1 |
| Relationship Officer | Client relationships 2, Product knowledge 2, Credit analysis 1, Sales conversations 2, AML/KYC 1 |
| Compliance / AML Officer | AML/KYC 3, Regulatory reporting 2, Investigations 2, Policy writing 1 |
| Risk Officer | Risk frameworks 2, Data analysis 2, Regulatory reporting 2, Presentation 1, AML/KYC 1 |
| Digital Banking Lead | Digital channels 2, Product ownership 2, Vendor management 1, Data analysis 1 |

### 5.3 People (about 24 named people, standing in for "about 180 staff")

- A spread of current roles: Customer Service Representatives, Tellers, Operations, IT Support, plus people already in each target role.
- Each person has skill claims with a source: self-declared, mentor-verified or HR-imported.
- Named story characters (invented):
  - **Keisha**, Customer Service Representative. Targets Credit Analyst. Already holds Report writing L1 (HR-imported), and Credit analysis L1 and Financial statements L1 (both self-declared, hatched). Gap: Credit analysis L1 to L2, Financial statements L1 to L2, Excel modelling L2, Risk rating L1. That is four gap skills, so her route has four milestones.
  - **Andre**, Credit Analyst who moved from the teller line in 2023. Holds Keisha's gap skills at the required level.
- Numbers are tuned so that the callouts in section 6 are true of the fixture:
  - AML/KYC is required by 3 roles and held, mentor-verified, by 4 people.
  - Compliance / AML Officer has 4 people within two skills of ready.

If a callout and the fixture disagree, the fixture wins and the callout is computed, never hard-coded.

## 6. Screens and script

All counts and callouts are computed from the fixture with the same gap function, so they stay true after interactions.

### Beat 0: Title card (wall material)
"MentorMatch for internal mobility. Prepared for National Commercial Bank of Anguilla." Synthetic-data tag. One button: "Open the wall".

### Beat 1: The wall (L&D admin, light panel)
- A gap map. Rows are the five roles, columns are their required skills, with sticky headers.
- Each cell shows people ready, climbing and with a gap. Verified holdings are solid; self-declared are hatched.
- A callout card computes the most-wanted, least-verified skill: "AML/KYC is required by 3 roles. 4 people hold it, mentor-verified."
- A secondary "Skill view" lists skills by roles needing them against verified holders: where to invest.

### Beat 2: The bench (admin)
- Selecting a role opens its bench: people within two skills of ready, sorted by gap size, with their current team.
- Compliance / AML Officer shows 4 people, most from Operations and Customer Service.

### Beat 3: The climb (employee: Keisha)
- The switcher moves to "Employee". Keisha's view shows her target role, Credit Analyst, and her personal gap as holds: held skills ticked (hatched if self-declared), missing skills as ghosts with their target level. The gap reads: Credit analysis L1 to L2, Financial statements L1 to L2, Excel modelling L2, Risk rating L1.
- Suggested mentors are ranked by how many of her gap skills they hold, with "has made this move" first. Andre leads.
- "Request Andre" sends the request. A line notes "Your manager has been notified."

### Beat 4: The route (mentor: Andre, wall material for the route)
- Andre sees a route drafted automatically from Keisha's gap: one milestone per gap skill (four), graded Start, V1, V2, V3, then the Top tag meaning "ready for Credit Analyst".
- He can reorder milestones (drag or up/down buttons) and rename them.
- Marking "Reading financial statements" reached opens a confirmation: "Confirm Keisha can now do Financial statements at level 2?" with Confirm / Not yet.
- Confirm writes a mentor-verified claim into demo state and ticks the hold in chalk.
- Andre can only confirm skills he holds at that level. The fixture guarantees this for the scripted path; the check is still enforced.

### Beat 5: The payoff (admin)
- Switching back to admin shows the change live: in the Credit Analyst view, Keisha's Financial statements cell (listed under Climbing) turns from hatched level 1 to solid level 2, the Credit Analyst row counts update, and the changed cells are highlighted.
- The skill view re-ranks.

## 7. Components

New, under `app/demo/ncba/` (demo-only; nothing here is imported by the main app):

- `fixture.ts`: skills, roles, people, claims, mentorships.
- `gap.ts`: pure functions. `personGap(person, role)`, `bench(role, people, maxGap)`, `roleCells(role, people)`, `skillDemand(roles, people)`, `suggestMentors(person, role, people)`. Unit-tested.
- `state.tsx`: a React context holding demo state (claims, the current viewer, Keisha's route) with `verify(personId, skill, level)`, `setViewer()` and `reset()`.
- `page.tsx`: the switcher bar, the title card, and the three views.
- `views/Wall.tsx`, `views/Bench.tsx`, `views/Climb.tsx`, `views/RouteBuilder.tsx`.

Reused as-is: `Hold`, `RouteStrip`, `Person`, `Button`, `.tape`, `.route-card`, `.wall`, `.panel`, `PageTitle`.

## 8. Edge behaviour

- **Reset** restores the fixture exactly.
- Verifying the same skill twice is a no-op.
- "Not yet" on the confirmation leaves the milestone open and changes nothing.
- An off-script click (for example, a different employee) shows that person's real computed gap from the fixture. There are no dead ends.
- Reduced motion: the cell pulse becomes a static highlight.

## 9. Testing

- Unit tests (Jest, existing setup) for `gap.ts`, covering:
  - gap calculation with levels;
  - bench threshold;
  - the section 6 callouts being true of the fixture;
  - the mentor ranking putting Andre first for Keisha;
  - verification only by a qualifying mentor.
- One scripted Playwright walkthrough of beats 0 to 5, asserting Keisha's cell state changes from hatched to solid.
- A visual check at 1440 and 1024 wide.

## 10. Out of scope

SSO, real multi-tenancy, persistence across browsers or users, editing the role catalogue, manager views beyond the one notification line, CSV import, NCBA branding beyond text, and any production schema change.

## 11. Open questions

- None blocking. Exact invented names beyond Keisha and Andre are chosen during the build.
