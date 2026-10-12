# MentorMatch for NCBA: B2B Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clickable, browser-only demo at `/demo/ncba` that shows NCBA (National Commercial Bank of Anguilla) a skill-gap map for internal mobility, a mentee's personal gap and mentor match, a mentor-set route, and mentor verification updating the map live.

**Architecture:** Pure TypeScript domain logic (`gap.ts`) and a pure reducer (`reducer.ts`) operate on a typed, deterministic fixture (`fixture.ts`). A React context (`state.tsx`) wraps the reducer. Four client views (Wall, Bench, Climb, RouteBuilder) render from that state using the existing MentorMatch "Route Setter" components. There is no database, API, or login.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind v4 (tokens in `app/globals.css`), Jest 30 via `next/jest` (node environment) for unit tests, `@playwright/test` 1.61.0 for one end-to-end walkthrough.

**Spec:** `docs/superpowers/specs/2026-10-12-ncba-b2b-demo-design.md`

## Global Constraints

- Route: `/demo/ncba`. Reachable only by URL. Not added to any navigation. Not in the auth middleware matcher (`middleware.ts` already excludes it; do not change `middleware.ts`).
- All demo state lives in the browser. No Prisma, no `fetch`, no API routes, no `localStorage`.
- The title card text reads exactly: `Prepared for National Commercial Bank of Anguilla`.
- A tag reading exactly `Synthetic demo data` is visible on every screen, including the title card.
- Headcount copy reads exactly: `about 180 staff (illustrative)`.
- NCBA appears by name in text only. No NCBA logo, colours, or brand marks. MentorMatch branding (the `Wordmark` component) throughout.
- Every person in the fixture is invented. Story characters: **Keisha Brooks** (employee) and **Andre Hughes** (mentor).
- Skill levels are 1 to 3. Only `source: "verified"` claims count as mentor-verified (solid). `self` and `hr` claims render hatched.
- A mentor may verify a skill only if they hold a verified claim for it at an equal or higher level.
- Managers are notified, never asked to approve. The only manager surface is the line `Your manager has been notified.`
- Every number shown in the UI is computed from state with the functions in `gap.ts`. No hard-coded counts in views.
- Follow DESIGN.md: grade-tape colours are the only accents; tape blue marks "current" only; links are ink with an underline; no small labels above headings (no eyebrows); Archivo for UI, Permanent Marker only on `.tape` labels.
- Imports use the `@/` alias (maps to the repo root), matching existing code.
- **Do not run `git commit`.** The branch `redesign/route-setter` holds uncommitted work the user will commit themselves. Each task ends with a verification step instead of a commit.
- Desktop first: must look right at 1440 and work at 1024 wide. Phone layout not required.

## Review Focus

1. **An off-script employee pick** (any person other than Keisha, including one with no target role). Expect: their real computed gap and a role picker, never a crash or blank screen. Tested in Task 2 (every person × role computes without throwing) and Task 6 (a role picker when `targetRoleId` is missing).
2. **Confirming the same milestone twice** (double click, or re-opening the dialog). Expect: no duplicate claim and no change on the second confirm. Tested in Task 3.
3. **A mentor who does not hold the skill at the required level trying to verify.** Expect: state unchanged and the UI says why. Tested in Task 3 (reducer) and Task 7 (disabled Confirm with explanation).
4. **Reset after several interactions.** Expect: the exact starting fixture, and the shared `PEOPLE` constant never mutated. Tested in Task 3.
5. **Reordering past the ends** (first milestone "up", last "down"). Expect: no-op, buttons disabled. Tested in Task 3 (reducer) and Task 7 (disabled buttons).

---

## File Structure

| File | Responsibility |
|---|---|
| `app/demo/ncba/types.ts` | Domain types shared by every other file. |
| `app/demo/ncba/gap.ts` | Pure functions: gaps, cells, bench, skill demand, mentor suggestions, verification rule, route drafting, grades. |
| `app/demo/ncba/fixture.ts` | Skills, roles, people, milestone titles, story ids, org copy. Deterministic data only. |
| `app/demo/ncba/reducer.ts` | `DemoState`, `Action`, `initialState()`, `demoReducer()`. Pure. |
| `app/demo/ncba/state.tsx` | `DemoProvider` and `useDemo()` (React context over the reducer). |
| `app/demo/ncba/ui.tsx` | Small shared demo UI: `SkillCell`, `LevelTag`, `SyntheticTag`, `skillName()`. |
| `app/demo/ncba/views/TitleCard.tsx` | Beat 0. |
| `app/demo/ncba/views/Wall.tsx` | Beat 1: role rows with skill cells, demand callout, skill view. |
| `app/demo/ncba/views/Bench.tsx` | Beat 2 and 5: selected role's climbers and near-ready people, per-skill cells. |
| `app/demo/ncba/views/Climb.tsx` | Beat 3: employee's gap and mentor suggestions. |
| `app/demo/ncba/views/RouteBuilder.tsx` | Beat 4: mentor's drafted route, reorder, rename, verify dialog. |
| `app/demo/ncba/Demo.tsx` | Client root: provider, viewer bar, view switching. |
| `app/demo/ncba/page.tsx` | Server page: metadata (noindex) and renders `<Demo />`. |
| `components/ConditionalNavbar.tsx` | Modify: hide the marketing navbar on `/demo`. |
| `__tests__/demo/ncba/gap.test.ts` | Unit tests for `gap.ts` on small inline data. |
| `__tests__/demo/ncba/fixture.test.ts` | Story invariants: the spec's callouts are true of the fixture. |
| `__tests__/demo/ncba/reducer.test.ts` | Reducer behaviour, including the Review Focus cases. |
| `playwright.config.ts` | Playwright config (e2e only). |
| `e2e/ncba-demo.spec.ts` | Scripted walkthrough of beats 0 to 5. |
| `package.json` | Modify: add `@playwright/test` devDependency and `test:e2e` script. |

---

### Task 1: Types and gap logic

**Files:**
- Create: `app/demo/ncba/types.ts`
- Create: `app/demo/ncba/gap.ts`
- Test: `__tests__/demo/ncba/gap.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (exact names later tasks rely on):
  - Types: `Level`, `Source`, `Skill`, `Requirement`, `Role`, `Claim`, `Person`, `GapItem`, `CellState`, `Milestone`, `Viewer`, `RoleCell`, `RoleSummary`, `BenchEntry`, `SkillDemand`, `MentorSuggestion`.
  - Functions: `claimFor(person, skillId)`, `personGap(person, role)`, `openCount(person, role)`, `cellState(person, skillId, need)`, `roleCells(role, people)`, `roleSummary(role, people)`, `bench(role, people, maxGap = 2)`, `skillDemand(roles, people, skills)`, `canVerify(mentor, skillId, level)`, `suggestMentors(person, role, people)`, `draftRoute(person, role, skills, titles)`, `grade(index)`.

- [ ] **Step 1: Write the types file**

`app/demo/ncba/types.ts`:

```ts
export type Level = 1 | 2 | 3;
/** verified = confirmed by a mentor; self = self-declared; hr = imported from HR records. */
export type Source = "verified" | "self" | "hr";

export type Skill = { id: string; name: string };
export type Requirement = { skill: string; level: Level };
export type Role = { id: string; title: string; reqs: Requirement[] };
export type Claim = { skill: string; level: Level; source: Source };

export type Person = {
  id: string;
  name: string;
  /** Current job title, e.g. "Customer Service Representative". */
  title: string;
  team: string;
  /** Set when the person currently holds one of the wall's roles. */
  roleId?: string;
  /** The wall role this person is climbing toward, if any. */
  targetRoleId?: string;
  /** A move this person has made, used to rank mentors. `to` is a role id. */
  madeMove?: { from: string; to: string; year: number };
  claims: Claim[];
};

export type GapItem = { skill: string; need: Level; have: number; source: Source | null; open: boolean };
/** verified/unverified = meets the level; short = holds it below the level; none = no claim. */
export type CellState = "verified" | "unverified" | "short" | "none";
export type Milestone = { id: string; skill: string; level: Level; title: string; reached: boolean };
export type Viewer = "admin" | "employee" | "mentor";

export type RoleCell = { skill: string; need: Level; verified: number; unverified: number };
export type RoleSummary = { ready: number; climbing: number; bench: number };
export type BenchEntry = { person: Person; open: number };
export type SkillDemand = { skill: string; roles: number; verifiedHolders: number };
export type MentorSuggestion = { mentor: Person; covers: string[]; madeMove: boolean };
```

- [ ] **Step 2: Write the failing tests**

`__tests__/demo/ncba/gap.test.ts`:

```ts
import {
  personGap, openCount, cellState, roleCells, roleSummary, bench,
  skillDemand, canVerify, suggestMentors, draftRoute, grade,
} from "@/app/demo/ncba/gap";
import type { Person, Role, Skill } from "@/app/demo/ncba/types";

const skills: Skill[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];
const role: Role = { id: "r1", title: "Role One", reqs: [{ skill: "a", level: 2 }, { skill: "b", level: 1 }] };
const role2: Role = { id: "r2", title: "Role Two", reqs: [{ skill: "a", level: 1 }] };

const p = (id: string, claims: Person["claims"], extra: Partial<Person> = {}): Person => ({
  id, name: id.toUpperCase(), title: "Staff", team: "Ops", claims, ...extra,
});

const empty = p("empty", []);
const halfway = p("half", [{ skill: "a", level: 1, source: "self" }]);
const ready = p("ready", [{ skill: "a", level: 2, source: "verified" }, { skill: "b", level: 1, source: "verified" }]);
const readySelf = p("readyself", [{ skill: "a", level: 3, source: "self" }, { skill: "b", level: 1, source: "hr" }]);
const holder = p("holder", [{ skill: "a", level: 2, source: "verified" }], { roleId: "r1" });

describe("personGap", () => {
  it("lists every requirement with have, source and open", () => {
    expect(personGap(halfway, role)).toEqual([
      { skill: "a", need: 2, have: 1, source: "self", open: true },
      { skill: "b", need: 1, have: 0, source: null, open: true },
    ]);
  });
  it("treats a self-declared claim at the level as met", () => {
    expect(openCount(readySelf, role)).toBe(0);
  });
  it("counts open items", () => {
    expect(openCount(empty, role)).toBe(2);
    expect(openCount(ready, role)).toBe(0);
  });
});

describe("cellState", () => {
  it("distinguishes verified, unverified, short and none", () => {
    expect(cellState(ready, "a", 2)).toBe("verified");
    expect(cellState(readySelf, "a", 2)).toBe("unverified");
    expect(cellState(halfway, "a", 2)).toBe("short");
    expect(cellState(empty, "a", 2)).toBe("none");
  });
});

describe("roleCells and roleSummary", () => {
  const people = [empty, halfway, ready, readySelf, holder, p("climber", [], { targetRoleId: "r1" })];
  it("counts people meeting each requirement, excluding current role holders", () => {
    expect(roleCells(role, people)).toEqual([
      { skill: "a", need: 2, verified: 1, unverified: 1 },
      { skill: "b", need: 1, verified: 1, unverified: 1 },
    ]);
  });
  it("summarises ready (all verified), climbing and bench", () => {
    // bench: empty, halfway and the claim-less climber are each two skills short
    expect(roleSummary(role, people)).toEqual({ ready: 1, climbing: 1, bench: 3 });
  });
});

describe("bench", () => {
  it("keeps people with 1..maxGap open items, sorted by gap then name", () => {
    const people = [empty, halfway, ready, holder, p("one", [{ skill: "a", level: 2, source: "verified" }])];
    expect(bench(role, people, 1).map((e) => [e.person.id, e.open])).toEqual([["one", 1]]);
    expect(bench(role, people, 2).map((e) => e.person.id)).toEqual(["one", "empty", "half"]);
  });
});

describe("skillDemand", () => {
  it("ranks by roles requiring the skill, then fewest verified holders", () => {
    const d = skillDemand([role, role2], [ready, readySelf], skills);
    expect(d).toEqual([
      { skill: "a", roles: 2, verifiedHolders: 1 },
      { skill: "b", roles: 1, verifiedHolders: 1 },
    ]);
  });
});

describe("canVerify", () => {
  it("requires a verified claim at or above the level", () => {
    expect(canVerify(ready, "a", 2)).toBe(true);
    expect(canVerify(ready, "a", 3)).toBe(false);
    expect(canVerify(readySelf, "a", 1)).toBe(false);
  });
});

describe("suggestMentors", () => {
  it("ranks people who made the move first, then by gap skills covered, never the person themself", () => {
    const mover = p("mover", [{ skill: "a", level: 2, source: "verified" }], { madeMove: { from: "Staff", to: "r1", year: 2023 } });
    const strong = p("strong", [{ skill: "a", level: 3, source: "verified" }, { skill: "b", level: 2, source: "verified" }]);
    const unrelated = p("unrelated", [{ skill: "c", level: 3, source: "verified" }]);
    const s = suggestMentors(empty, role, [empty, mover, strong, unrelated]);
    expect(s.map((x) => [x.mentor.id, x.covers, x.madeMove])).toEqual([
      ["mover", ["a"], true],
      ["strong", ["a", "b"], false],
    ]);
  });
});

describe("draftRoute and grade", () => {
  it("creates one milestone per open gap item in requirement order", () => {
    const route = draftRoute(halfway, role, skills, { b: "Beta basics" });
    expect(route).toEqual([
      { id: "half-a", skill: "a", level: 2, title: "Alpha to level 2", reached: false },
      { id: "half-b", skill: "b", level: 1, title: "Beta basics", reached: false },
    ]);
  });
  it("grades Start, V1, V2", () => {
    expect([0, 1, 2].map(grade)).toEqual(["Start", "V1", "V2"]);
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `npx jest __tests__/demo/ncba/gap.test.ts`
Expected: FAIL with `Cannot find module '@/app/demo/ncba/gap'`.

- [ ] **Step 4: Implement `gap.ts`**

`app/demo/ncba/gap.ts`:

```ts
import type {
  BenchEntry, CellState, Claim, GapItem, Level, MentorSuggestion, Milestone,
  Person, Role, RoleCell, RoleSummary, Skill, SkillDemand,
} from "./types";

export function claimFor(person: Person, skillId: string): Claim | undefined {
  return person.claims.find((c) => c.skill === skillId);
}

/** Every requirement of the role, with what the person holds against it. */
export function personGap(person: Person, role: Role): GapItem[] {
  return role.reqs.map((r) => {
    const c = claimFor(person, r.skill);
    const have = c?.level ?? 0;
    return { skill: r.skill, need: r.level, have, source: c?.source ?? null, open: have < r.level };
  });
}

export function openCount(person: Person, role: Role): number {
  return personGap(person, role).filter((g) => g.open).length;
}

export function cellState(person: Person, skillId: string, need: Level): CellState {
  const c = claimFor(person, skillId);
  if (!c) return "none";
  if (c.level < need) return "short";
  return c.source === "verified" ? "verified" : "unverified";
}

const outsiders = (role: Role, people: Person[]) => people.filter((p) => p.roleId !== role.id);

export function roleCells(role: Role, people: Person[]): RoleCell[] {
  const pool = outsiders(role, people);
  return role.reqs.map((r) => ({
    skill: r.skill,
    need: r.level,
    verified: pool.filter((p) => cellState(p, r.skill, r.level) === "verified").length,
    unverified: pool.filter((p) => cellState(p, r.skill, r.level) === "unverified").length,
  }));
}

export function bench(role: Role, people: Person[], maxGap = 2): BenchEntry[] {
  return outsiders(role, people)
    .map((person) => ({ person, open: openCount(person, role) }))
    .filter((e) => e.open >= 1 && e.open <= maxGap)
    .sort((a, b) => a.open - b.open || a.person.name.localeCompare(b.person.name));
}

export function roleSummary(role: Role, people: Person[]): RoleSummary {
  const pool = outsiders(role, people);
  return {
    ready: pool.filter((p) => role.reqs.every((r) => cellState(p, r.skill, r.level) === "verified")).length,
    climbing: people.filter((p) => p.targetRoleId === role.id).length,
    bench: bench(role, people).length,
  };
}

/** Skills ranked by how many roles need them, then by fewest mentor-verified holders. */
export function skillDemand(roles: Role[], people: Person[], skills: Skill[]): SkillDemand[] {
  return skills
    .map((s) => ({
      skill: s.id,
      roles: roles.filter((r) => r.reqs.some((q) => q.skill === s.id)).length,
      verifiedHolders: people.filter((p) => p.claims.some((c) => c.skill === s.id && c.source === "verified")).length,
    }))
    .filter((d) => d.roles > 0)
    .sort((a, b) => b.roles - a.roles || a.verifiedHolders - b.verifiedHolders || a.skill.localeCompare(b.skill));
}

/** A mentor can verify a skill only if they hold it, mentor-verified, at the level or above. */
export function canVerify(mentor: Person, skillId: string, level: Level): boolean {
  return mentor.claims.some((c) => c.skill === skillId && c.source === "verified" && c.level >= level);
}

export function suggestMentors(person: Person, role: Role, people: Person[]): MentorSuggestion[] {
  const open = personGap(person, role).filter((g) => g.open);
  return people
    .filter((m) => m.id !== person.id)
    .map((mentor) => ({
      mentor,
      covers: open.filter((g) => canVerify(mentor, g.skill, g.need)).map((g) => g.skill),
      madeMove: mentor.madeMove?.to === role.id,
    }))
    .filter((s) => s.covers.length > 0)
    .sort(
      (a, b) =>
        Number(b.madeMove) - Number(a.madeMove) ||
        b.covers.length - a.covers.length ||
        a.mentor.name.localeCompare(b.mentor.name)
    );
}

export function draftRoute(person: Person, role: Role, skills: Skill[], titles: Record<string, string>): Milestone[] {
  return personGap(person, role)
    .filter((g) => g.open)
    .map((g) => ({
      id: `${person.id}-${g.skill}`,
      skill: g.skill,
      level: g.need,
      title: titles[g.skill] ?? `${skills.find((s) => s.id === g.skill)?.name ?? g.skill} to level ${g.need}`,
      reached: false,
    }));
}

export function grade(index: number): string {
  return index === 0 ? "Start" : `V${index}`;
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `npx jest __tests__/demo/ncba/gap.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p . 2>&1 | grep "app/demo" || echo "no demo type errors"`
Expected: `no demo type errors`.

---

### Task 2: Fixture and story invariants

**Files:**
- Create: `app/demo/ncba/fixture.ts`
- Test: `__tests__/demo/ncba/fixture.test.ts`

**Interfaces:**
- Consumes: types and `gap.ts` functions from Task 1.
- Produces: `SKILLS: Skill[]`, `ROLES: Role[]`, `PEOPLE: Person[]`, `MILESTONE_TITLES: Record<string, string>`, `STORY: { employeeId: "keisha"; mentorId: "andre"; roleId: "credit_analyst" }`, `ORG: { name: string; short: string; staff: string }`, `roleById(id: string): Role`.

- [ ] **Step 1: Write the failing invariant tests**

`__tests__/demo/ncba/fixture.test.ts`:

```ts
import { SKILLS, ROLES, PEOPLE, STORY, ORG, roleById } from "@/app/demo/ncba/fixture";
import { personGap, bench, skillDemand, suggestMentors, canVerify, roleSummary } from "@/app/demo/ncba/gap";

const byId = (id: string) => PEOPLE.find((p) => p.id === id)!;

describe("NCBA fixture", () => {
  it("has 18 skills, 5 roles and about 24 people, all claims referencing real skills", () => {
    expect(SKILLS).toHaveLength(18);
    expect(ROLES.map((r) => r.id)).toEqual([
      "credit_analyst", "relationship_officer", "compliance_officer", "risk_officer", "digital_lead",
    ]);
    expect(PEOPLE.length).toBeGreaterThanOrEqual(22);
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const p of PEOPLE) for (const c of p.claims) expect(ids.has(c.skill)).toBe(true);
    for (const r of ROLES) for (const q of r.reqs) expect(ids.has(q.skill)).toBe(true);
  });

  it("uses the exact org copy", () => {
    expect(ORG.name).toBe("National Commercial Bank of Anguilla");
    expect(ORG.staff).toBe("about 180 staff (illustrative)");
  });

  it("callout: AML/KYC is the top-demand skill, required by 3 roles, held verified by 4 people", () => {
    expect(skillDemand(ROLES, PEOPLE, SKILLS)[0]).toEqual({ skill: "aml_kyc", roles: 3, verifiedHolders: 4 });
  });

  it("bench: Compliance / AML Officer has 4 people within two skills, mostly Operations and Customer Service", () => {
    const b = bench(roleById("compliance_officer"), PEOPLE);
    expect(b).toHaveLength(4);
    const teams = b.map((e) => e.person.team);
    expect(teams.filter((t) => t === "Operations" || t === "Customer Service").length).toBeGreaterThanOrEqual(3);
  });

  it("Keisha's gap to Credit Analyst is exactly the four scripted items", () => {
    const keisha = byId(STORY.employeeId);
    expect(keisha.targetRoleId).toBe("credit_analyst");
    const open = personGap(keisha, roleById("credit_analyst")).filter((g) => g.open);
    expect(open.map((g) => [g.skill, g.have, g.need])).toEqual([
      ["credit_analysis", 1, 2],
      ["fin_statements", 1, 2],
      ["excel", 0, 2],
      ["risk_rating", 0, 1],
    ]);
  });

  it("Keisha's Financial statements claim starts self-declared at level 1", () => {
    expect(byId(STORY.employeeId).claims.find((c) => c.skill === "fin_statements")).toEqual({
      skill: "fin_statements", level: 1, source: "self",
    });
  });

  it("Andre is the first suggested mentor, made the move, and can verify every gap skill", () => {
    const keisha = byId(STORY.employeeId);
    const role = roleById(STORY.roleId);
    const [first] = suggestMentors(keisha, role, PEOPLE);
    expect(first.mentor.id).toBe(STORY.mentorId);
    expect(first.madeMove).toBe(true);
    for (const g of personGap(keisha, role).filter((x) => x.open)) {
      expect(canVerify(byId(STORY.mentorId), g.skill, g.need)).toBe(true);
    }
  });

  it("every person and role combination computes without throwing (off-script picks never crash)", () => {
    for (const p of PEOPLE) for (const r of ROLES) {
      expect(() => personGap(p, r)).not.toThrow();
      expect(suggestMentors(p, r, PEOPLE).every((s) => s.mentor.id !== p.id)).toBe(true);
    }
    for (const r of ROLES) expect(() => roleSummary(r, PEOPLE)).not.toThrow();
  });

  it("people ids are unique", () => {
    expect(new Set(PEOPLE.map((p) => p.id)).size).toBe(PEOPLE.length);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx jest __tests__/demo/ncba/fixture.test.ts`
Expected: FAIL with `Cannot find module '@/app/demo/ncba/fixture'`.

- [ ] **Step 3: Implement the fixture**

`app/demo/ncba/fixture.ts`:

```ts
import type { Claim, Level, Person, Role, Skill, Source } from "./types";

/** Every person and figure here is invented for a demo. Nothing is NCBA data. */
export const ORG = {
  name: "National Commercial Bank of Anguilla",
  short: "NCBA",
  staff: "about 180 staff (illustrative)",
};

export const SKILLS: Skill[] = [
  { id: "credit_analysis", name: "Credit analysis" },
  { id: "fin_statements", name: "Financial statements" },
  { id: "excel", name: "Excel modelling" },
  { id: "risk_rating", name: "Risk rating" },
  { id: "report_writing", name: "Report writing" },
  { id: "client_rel", name: "Client relationships" },
  { id: "product_knowledge", name: "Product knowledge" },
  { id: "sales", name: "Sales conversations" },
  { id: "aml_kyc", name: "AML/KYC" },
  { id: "reg_reporting", name: "Regulatory reporting" },
  { id: "investigations", name: "Investigations" },
  { id: "policy_writing", name: "Policy writing" },
  { id: "risk_frameworks", name: "Risk frameworks" },
  { id: "data_analysis", name: "Data analysis" },
  { id: "digital_channels", name: "Digital channels" },
  { id: "product_ownership", name: "Product ownership" },
  { id: "vendor_mgmt", name: "Vendor management" },
  { id: "presentation", name: "Presentation" },
];

const req = (skill: string, level: Level) => ({ skill, level });

export const ROLES: Role[] = [
  { id: "credit_analyst", title: "Credit Analyst", reqs: [req("credit_analysis", 2), req("fin_statements", 2), req("excel", 2), req("risk_rating", 1), req("report_writing", 1)] },
  { id: "relationship_officer", title: "Relationship Officer", reqs: [req("client_rel", 2), req("product_knowledge", 2), req("credit_analysis", 1), req("sales", 2), req("aml_kyc", 1)] },
  { id: "compliance_officer", title: "Compliance / AML Officer", reqs: [req("aml_kyc", 3), req("reg_reporting", 2), req("investigations", 2), req("policy_writing", 1)] },
  { id: "risk_officer", title: "Risk Officer", reqs: [req("risk_frameworks", 2), req("data_analysis", 2), req("reg_reporting", 2), req("presentation", 1), req("aml_kyc", 1)] },
  { id: "digital_lead", title: "Digital Banking Lead", reqs: [req("digital_channels", 2), req("product_ownership", 2), req("vendor_mgmt", 1), req("data_analysis", 1)] },
];

export function roleById(id: string): Role {
  const r = ROLES.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown role ${id}`);
  return r;
}

/** claim shorthand: c("excel", 2, "v") */
const c = (skill: string, level: Level, s: "v" | "s" | "h"): Claim => ({
  skill,
  level,
  source: ({ v: "verified", s: "self", h: "hr" } as const)[s] as Source,
});

export const PEOPLE: Person[] = [
  // Story
  { id: "keisha", name: "Keisha Brooks", title: "Customer Service Representative", team: "Customer Service", targetRoleId: "credit_analyst",
    claims: [c("report_writing", 1, "h"), c("credit_analysis", 1, "s"), c("fin_statements", 1, "s"), c("client_rel", 2, "s"), c("product_knowledge", 2, "h"), c("sales", 1, "s")] },
  { id: "andre", name: "Andre Hughes", title: "Credit Analyst", team: "Credit", roleId: "credit_analyst", madeMove: { from: "Teller", to: "credit_analyst", year: 2023 },
    claims: [c("credit_analysis", 3, "v"), c("fin_statements", 2, "v"), c("excel", 2, "v"), c("risk_rating", 2, "v"), c("report_writing", 2, "v"), c("client_rel", 1, "s")] },
  { id: "natalie", name: "Natalie Connor", title: "Credit Analyst", team: "Credit", roleId: "credit_analyst",
    claims: [c("credit_analysis", 2, "v"), c("fin_statements", 2, "v"), c("excel", 1, "v"), c("risk_rating", 1, "v"), c("report_writing", 2, "v")] },

  // Compliance bench (exactly four people within two skills)
  { id: "shanice", name: "Shanice Richardson", title: "Operations Officer", team: "Operations",
    claims: [c("aml_kyc", 3, "v"), c("reg_reporting", 2, "v"), c("investigations", 1, "s"), c("policy_writing", 1, "s")] },
  { id: "devon", name: "Devon Hodge", title: "Operations Officer", team: "Operations",
    claims: [c("aml_kyc", 2, "v"), c("reg_reporting", 2, "s"), c("investigations", 2, "s")] },
  { id: "tamara", name: "Tamara Gumbs", title: "Customer Service Representative", team: "Customer Service",
    claims: [c("aml_kyc", 2, "s"), c("reg_reporting", 1, "s"), c("investigations", 2, "v"), c("policy_writing", 1, "s")] },
  { id: "kareem", name: "Kareem Lake", title: "Teller", team: "Branch",
    claims: [c("aml_kyc", 3, "h"), c("reg_reporting", 2, "h"), c("investigations", 1, "s"), c("policy_writing", 1, "h")] },

  // Current role holders
  { id: "joy", name: "Joy Fleming", title: "Compliance Officer", team: "Compliance", roleId: "compliance_officer",
    claims: [c("aml_kyc", 3, "v"), c("reg_reporting", 2, "v"), c("investigations", 3, "v"), c("policy_writing", 2, "v")] },
  { id: "marlon", name: "Marlon Webster", title: "Risk Officer", team: "Risk", roleId: "risk_officer", madeMove: { from: "Operations Officer", to: "risk_officer", year: 2022 },
    claims: [c("risk_frameworks", 3, "v"), c("data_analysis", 2, "v"), c("reg_reporting", 2, "v"), c("presentation", 2, "v"), c("aml_kyc", 1, "v")] },
  { id: "sharon", name: "Sharon Banks", title: "Relationship Officer", team: "Retail Banking", roleId: "relationship_officer",
    claims: [c("client_rel", 3, "v"), c("product_knowledge", 2, "v"), c("credit_analysis", 1, "v"), c("sales", 2, "v"), c("aml_kyc", 1, "s")] },
  { id: "jerome", name: "Jerome Fleming", title: "Digital Banking Lead", team: "Digital", roleId: "digital_lead", madeMove: { from: "IT Support", to: "digital_lead", year: 2024 },
    claims: [c("digital_channels", 3, "v"), c("product_ownership", 2, "v"), c("vendor_mgmt", 2, "v"), c("data_analysis", 1, "v")] },

  // Other climbers
  { id: "alicia", name: "Alicia Rogers", title: "IT Support Specialist", team: "IT", targetRoleId: "digital_lead",
    claims: [c("digital_channels", 1, "s"), c("data_analysis", 1, "s"), c("vendor_mgmt", 1, "h")] },
  { id: "dwayne", name: "Dwayne Carty", title: "Teller", team: "Branch", targetRoleId: "relationship_officer",
    claims: [c("client_rel", 1, "s"), c("product_knowledge", 1, "h"), c("sales", 1, "s")] },
  { id: "monique", name: "Monique Harrigan", title: "Customer Service Representative", team: "Customer Service", targetRoleId: "relationship_officer",
    claims: [c("client_rel", 2, "s"), c("product_knowledge", 2, "s"), c("sales", 2, "s")] },
  { id: "leroy", name: "Leroy Proctor", title: "Operations Officer", team: "Operations", targetRoleId: "risk_officer",
    claims: [c("data_analysis", 1, "s"), c("reg_reporting", 1, "h"), c("presentation", 1, "s")] },
  { id: "trevor", name: "Trevor Hodge", title: "Operations Officer", team: "Operations", targetRoleId: "credit_analyst",
    claims: [c("fin_statements", 1, "s"), c("excel", 2, "s"), c("report_writing", 1, "s")] },

  // Everyone else (no target yet)
  { id: "kimberly", name: "Kimberly Lloyd", title: "Teller", team: "Branch", claims: [c("excel", 1, "s"), c("report_writing", 1, "h")] },
  { id: "omari", name: "Omari Smith", title: "IT Support Specialist", team: "IT",
    claims: [c("data_analysis", 2, "v"), c("digital_channels", 1, "s"), c("product_ownership", 1, "s")] },
  { id: "gail", name: "Gail Webster", title: "Branch Supervisor", team: "Branch",
    claims: [c("client_rel", 3, "v"), c("product_knowledge", 3, "v"), c("sales", 2, "v"), c("presentation", 2, "v"), c("report_writing", 2, "v")] },
  { id: "natasha", name: "Natasha Gumbs", title: "Customer Service Representative", team: "Customer Service", claims: [c("client_rel", 1, "h")] },
  { id: "sean", name: "Sean Mussington", title: "Teller", team: "Branch", claims: [c("product_knowledge", 1, "h"), c("sales", 1, "s")] },
  { id: "patrice", name: "Patrice Lake", title: "Operations Officer", team: "Operations", claims: [c("reg_reporting", 1, "s"), c("policy_writing", 1, "s")] },
  { id: "avery", name: "Avery Connor", title: "IT Support Specialist", team: "IT", claims: [c("vendor_mgmt", 1, "s"), c("digital_channels", 2, "s")] },
  { id: "hazel", name: "Hazel Brooks", title: "Finance Officer", team: "Finance",
    claims: [c("fin_statements", 2, "v"), c("excel", 3, "v"), c("report_writing", 2, "v"), c("data_analysis", 2, "s")] },
];

/** Friendlier milestone names for the scripted route. Other skills fall back to "<Skill> to level N". */
export const MILESTONE_TITLES: Record<string, string> = {
  credit_analysis: "Credit analysis in practice",
  fin_statements: "Reading financial statements",
  excel: "Excel modelling for credit",
  risk_rating: "Risk rating basics",
};

export const STORY = { employeeId: "keisha", mentorId: "andre", roleId: "credit_analyst" } as const;
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npx jest __tests__/demo/ncba`
Expected: PASS for `gap.test.ts` and `fixture.test.ts`. If an invariant fails, adjust only the fixture claims (never the test's scripted numbers, which come from the spec) until it passes, keeping every person invented.

---

### Task 3: Demo reducer

**Files:**
- Create: `app/demo/ncba/reducer.ts`
- Test: `__tests__/demo/ncba/reducer.test.ts`

**Interfaces:**
- Consumes: `gap.ts` (`canVerify`, `draftRoute`), `fixture.ts` (`PEOPLE`, `ROLES`, `SKILLS`, `MILESTONE_TITLES`, `STORY`, `roleById`), types.
- Produces:
  - `type Route = { personId: string; mentorId: string; roleId: string; milestones: Milestone[] }`
  - `type DemoState = { started: boolean; viewer: Viewer; people: Person[]; routes: Record<string, Route>; selectedRoleId: string; employeeId: string; lastChange: { personId: string; skill: string; seq: number } | null; seq: number }`
  - `type Action` (union below)
  - `initialState(): DemoState`
  - `demoReducer(state: DemoState, action: Action): DemoState`

- [ ] **Step 1: Write the failing tests**

`__tests__/demo/ncba/reducer.test.ts`:

```ts
import { demoReducer, initialState, type DemoState } from "@/app/demo/ncba/reducer";
import { PEOPLE, STORY } from "@/app/demo/ncba/fixture";

const keishaClaim = (s: DemoState, skill: string) =>
  s.people.find((p) => p.id === "keisha")!.claims.find((c) => c.skill === skill);

const requested = () =>
  demoReducer(initialState(), { type: "requestMentor", personId: STORY.employeeId, mentorId: STORY.mentorId, roleId: STORY.roleId });

describe("demoReducer", () => {
  it("starts on the title card as admin with Keisha and Credit Analyst selected", () => {
    const s = initialState();
    expect(s).toMatchObject({ started: false, viewer: "admin", employeeId: "keisha", selectedRoleId: "credit_analyst", routes: {} });
  });

  it("start and setViewer", () => {
    let s = demoReducer(initialState(), { type: "start" });
    expect(s.started).toBe(true);
    s = demoReducer(s, { type: "setViewer", viewer: "mentor" });
    expect(s.viewer).toBe("mentor");
  });

  it("requestMentor drafts a four-milestone route and is idempotent", () => {
    const s = requested();
    expect(s.routes.keisha.mentorId).toBe("andre");
    expect(s.routes.keisha.milestones.map((m) => m.skill)).toEqual(["credit_analysis", "fin_statements", "excel", "risk_rating"]);
    expect(demoReducer(s, { type: "requestMentor", personId: "keisha", mentorId: "natalie", roleId: "credit_analyst" })).toBe(s);
  });

  it("requestMentor sets the person's target role when they had none", () => {
    const s = demoReducer(initialState(), { type: "requestMentor", personId: "kimberly", mentorId: "andre", roleId: "credit_analyst" });
    expect(s.people.find((p) => p.id === "kimberly")!.targetRoleId).toBe("credit_analyst");
  });

  it("verify marks the milestone reached and upgrades the claim to verified at the level", () => {
    const before = requested();
    const s = demoReducer(before, { type: "verify", personId: "keisha", milestoneId: "keisha-fin_statements" });
    expect(keishaClaim(before, "fin_statements")).toEqual({ skill: "fin_statements", level: 1, source: "self" });
    expect(keishaClaim(s, "fin_statements")).toEqual({ skill: "fin_statements", level: 2, source: "verified" });
    expect(s.routes.keisha.milestones.find((m) => m.skill === "fin_statements")!.reached).toBe(true);
    expect(s.lastChange).toEqual({ personId: "keisha", skill: "fin_statements", seq: 1 });
  });

  it("verify adds a claim when the person had none", () => {
    const s = demoReducer(requested(), { type: "verify", personId: "keisha", milestoneId: "keisha-excel" });
    expect(keishaClaim(s, "excel")).toEqual({ skill: "excel", level: 2, source: "verified" });
  });

  it("confirming the same milestone twice is a no-op", () => {
    const once = demoReducer(requested(), { type: "verify", personId: "keisha", milestoneId: "keisha-fin_statements" });
    expect(demoReducer(once, { type: "verify", personId: "keisha", milestoneId: "keisha-fin_statements" })).toBe(once);
  });

  it("a mentor who can't verify the skill changes nothing", () => {
    // Natalie holds Excel only at level 1, below the level 2 Keisha needs.
    const s = demoReducer(initialState(), { type: "requestMentor", personId: "keisha", mentorId: "natalie", roleId: "credit_analyst" });
    expect(demoReducer(s, { type: "verify", personId: "keisha", milestoneId: "keisha-excel" })).toBe(s);
  });

  it("verify without a route or with an unknown milestone is a no-op", () => {
    const s = initialState();
    expect(demoReducer(s, { type: "verify", personId: "keisha", milestoneId: "keisha-excel" })).toBe(s);
    const r = requested();
    expect(demoReducer(r, { type: "verify", personId: "keisha", milestoneId: "nope" })).toBe(r);
  });

  it("move reorders and ignores moves past either end", () => {
    const s = requested();
    const moved = demoReducer(s, { type: "move", personId: "keisha", from: 0, to: 1 });
    expect(moved.routes.keisha.milestones.map((m) => m.skill).slice(0, 2)).toEqual(["fin_statements", "credit_analysis"]);
    expect(demoReducer(s, { type: "move", personId: "keisha", from: 0, to: -1 })).toBe(s);
    expect(demoReducer(s, { type: "move", personId: "keisha", from: 3, to: 4 })).toBe(s);
  });

  it("rename changes a title, ignoring blank titles", () => {
    const s = requested();
    const r = demoReducer(s, { type: "rename", personId: "keisha", milestoneId: "keisha-excel", title: "Build a credit model" });
    expect(r.routes.keisha.milestones.find((m) => m.id === "keisha-excel")!.title).toBe("Build a credit model");
    expect(demoReducer(s, { type: "rename", personId: "keisha", milestoneId: "keisha-excel", title: "   " })).toBe(s);
  });

  it("reset restores the exact starting state and never mutates the shared fixture", () => {
    const snapshot = JSON.stringify(PEOPLE);
    let s = requested();
    s = demoReducer(s, { type: "verify", personId: "keisha", milestoneId: "keisha-fin_statements" });
    s = demoReducer(s, { type: "setViewer", viewer: "mentor" });
    expect(demoReducer(s, { type: "reset" })).toEqual(initialState());
    expect(JSON.stringify(PEOPLE)).toBe(snapshot);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx jest __tests__/demo/ncba/reducer.test.ts`
Expected: FAIL with `Cannot find module '@/app/demo/ncba/reducer'`.

- [ ] **Step 3: Implement the reducer**

`app/demo/ncba/reducer.ts`:

```ts
import { canVerify, draftRoute } from "./gap";
import { MILESTONE_TITLES, PEOPLE, SKILLS, STORY, roleById } from "./fixture";
import type { Milestone, Person, Viewer } from "./types";

export type Route = { personId: string; mentorId: string; roleId: string; milestones: Milestone[] };

export type DemoState = {
  started: boolean;
  viewer: Viewer;
  people: Person[];
  routes: Record<string, Route>;
  selectedRoleId: string;
  employeeId: string;
  lastChange: { personId: string; skill: string; seq: number } | null;
  seq: number;
};

export type Action =
  | { type: "start" }
  | { type: "setViewer"; viewer: Viewer }
  | { type: "selectRole"; roleId: string }
  | { type: "selectEmployee"; personId: string }
  | { type: "requestMentor"; personId: string; mentorId: string; roleId: string }
  | { type: "move"; personId: string; from: number; to: number }
  | { type: "rename"; personId: string; milestoneId: string; title: string }
  | { type: "verify"; personId: string; milestoneId: string }
  | { type: "reset" };

/** A deep copy, so demo interactions never touch the shared fixture. */
const clonePeople = (): Person[] => JSON.parse(JSON.stringify(PEOPLE));

export function initialState(): DemoState {
  return {
    started: false,
    viewer: "admin",
    people: clonePeople(),
    routes: {},
    selectedRoleId: STORY.roleId,
    employeeId: STORY.employeeId,
    lastChange: null,
    seq: 0,
  };
}

const updatePerson = (people: Person[], id: string, fn: (p: Person) => Person) =>
  people.map((p) => (p.id === id ? fn(p) : p));

export function demoReducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "start":
      return { ...state, started: true, viewer: "admin" };
    case "setViewer":
      return { ...state, viewer: action.viewer };
    case "selectRole":
      return { ...state, selectedRoleId: action.roleId };
    case "selectEmployee":
      return { ...state, employeeId: action.personId };

    case "requestMentor": {
      if (state.routes[action.personId]) return state;
      const person = state.people.find((p) => p.id === action.personId);
      if (!person) return state;
      const role = roleById(action.roleId);
      const milestones = draftRoute(person, role, SKILLS, MILESTONE_TITLES);
      return {
        ...state,
        people: updatePerson(state.people, person.id, (p) => ({ ...p, targetRoleId: role.id })),
        routes: { ...state.routes, [person.id]: { personId: person.id, mentorId: action.mentorId, roleId: role.id, milestones } },
      };
    }

    case "move": {
      const route = state.routes[action.personId];
      if (!route) return state;
      const n = route.milestones.length;
      if (action.from < 0 || action.from >= n || action.to < 0 || action.to >= n || action.from === action.to) return state;
      const milestones = [...route.milestones];
      const [m] = milestones.splice(action.from, 1);
      milestones.splice(action.to, 0, m);
      return { ...state, routes: { ...state.routes, [action.personId]: { ...route, milestones } } };
    }

    case "rename": {
      const route = state.routes[action.personId];
      const title = action.title.trim();
      if (!route || !title || !route.milestones.some((m) => m.id === action.milestoneId)) return state;
      const milestones = route.milestones.map((m) => (m.id === action.milestoneId ? { ...m, title } : m));
      return { ...state, routes: { ...state.routes, [action.personId]: { ...route, milestones } } };
    }

    case "verify": {
      const route = state.routes[action.personId];
      const milestone = route?.milestones.find((m) => m.id === action.milestoneId);
      if (!route || !milestone || milestone.reached) return state;
      const mentor = state.people.find((p) => p.id === route.mentorId);
      if (!mentor || !canVerify(mentor, milestone.skill, milestone.level)) return state;

      const people = updatePerson(state.people, action.personId, (p) => {
        const existing = p.claims.find((c) => c.skill === milestone.skill);
        const level = existing ? (Math.max(existing.level, milestone.level) as typeof milestone.level) : milestone.level;
        const claim = { skill: milestone.skill, level, source: "verified" as const };
        return {
          ...p,
          claims: existing ? p.claims.map((c) => (c.skill === milestone.skill ? claim : c)) : [...p.claims, claim],
        };
      });
      const milestones = route.milestones.map((m) => (m.id === milestone.id ? { ...m, reached: true } : m));
      const seq = state.seq + 1;
      return {
        ...state,
        people,
        routes: { ...state.routes, [action.personId]: { ...route, milestones } },
        lastChange: { personId: action.personId, skill: milestone.skill, seq },
        seq,
      };
    }

    case "reset":
      return initialState();
  }
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npx jest __tests__/demo/ncba`
Expected: PASS for all three test files.

---

### Task 4: Demo shell, title card, viewer bar, shared UI

**Files:**
- Create: `app/demo/ncba/state.tsx`
- Create: `app/demo/ncba/ui.tsx`
- Create: `app/demo/ncba/views/TitleCard.tsx`
- Create: `app/demo/ncba/Demo.tsx`
- Create: `app/demo/ncba/page.tsx`
- Modify: `components/ConditionalNavbar.tsx` (add `"/demo"` to `OWN_CHROME`)
- Temporary stubs (replaced in Tasks 5 to 7): `app/demo/ncba/views/Wall.tsx`, `views/Bench.tsx`, `views/Climb.tsx`, `views/RouteBuilder.tsx`

**Interfaces:**
- Consumes: reducer (Task 3), fixture (`ORG`, `SKILLS`), existing components `Wordmark` (`@/components/world/Wordmark`), `Button` (`@/components/ui/button`).
- Produces:
  - `DemoProvider({ children })`, `useDemo(): { state: DemoState; dispatch: React.Dispatch<Action> }`
  - `skillName(id: string): string`
  - `SkillCell({ state, have, need, highlight, testId }: { state: CellState; have: number; need: Level; highlight?: boolean; testId?: string })` renders `data-state={state}`
  - `LevelTag({ level }: { level: number })`
  - `SyntheticTag()`
  - Default-export view components `Wall`, `Bench`, `Climb`, `RouteBuilder`, `TitleCard`, each taking no props.

- [ ] **Step 1: State provider**

`app/demo/ncba/state.tsx`:

```tsx
"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { demoReducer, initialState, type Action, type DemoState } from "./reducer";

const Ctx = createContext<{ state: DemoState; dispatch: Dispatch<Action> } | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used inside DemoProvider");
  return v;
}
```

- [ ] **Step 2: Shared demo UI**

`app/demo/ncba/ui.tsx`:

```tsx
import { SKILLS } from "./fixture";
import type { CellState, Level } from "./types";

export function skillName(id: string): string {
  return SKILLS.find((s) => s.id === id)?.name ?? id;
}

const HATCH = "repeating-linear-gradient(135deg, rgb(23 25 28 / 0.18) 0 3px, transparent 3px 7px)";

/**
 * One person-by-skill cell. Solid ink = mentor-verified at the level, hatched = self-declared or
 * HR-imported at the level, hatched outline = held below the level, empty = no claim.
 */
export function SkillCell({
  state, have, need, highlight = false, testId,
}: { state: CellState; have: number; need: Level; highlight?: boolean; testId?: string }) {
  const label =
    state === "verified" ? `Verified at level ${have}` :
    state === "unverified" ? `Self-declared at level ${have}, not yet verified` :
    state === "short" ? `Level ${have} of ${need} needed` : `Not held, level ${need} needed`;
  return (
    <span
      data-testid={testId}
      data-state={state}
      title={label}
      aria-label={label}
      className={`tabular inline-grid size-9 place-items-center rounded-[8px] text-xs font-bold transition-shadow ${
        state === "verified" ? "bg-ink text-chalk" :
        state === "unverified" ? "border border-ink/30 text-ink" :
        state === "short" ? "border border-dashed border-ink/40 text-ink-soft" : "border border-ink/10 text-transparent"
      } ${highlight ? "ring-[3px] ring-tape-blue ring-offset-2" : ""}`}
      style={state === "unverified" || state === "short" ? { backgroundImage: HATCH } : undefined}
    >
      {have > 0 ? have : "·"}
    </span>
  );
}

export function LevelTag({ level }: { level: number }) {
  return <span className="tabular rounded-[4px] bg-ink px-1.5 py-0.5 text-xs font-bold text-tape-yellow">L{level}</span>;
}

export function SyntheticTag() {
  return (
    <span className="rounded-full border border-current/30 px-2.5 py-1 text-xs font-semibold">Synthetic demo data</span>
  );
}
```

- [ ] **Step 3: Title card**

`app/demo/ncba/views/TitleCard.tsx`:

```tsx
"use client";

import { ArrowRight } from "lucide-react";
import Hold from "@/components/world/Hold";
import { ORG } from "../fixture";
import { useDemo } from "../state";

export default function TitleCard() {
  const { dispatch } = useDemo();
  return (
    <section className="wall wall-panels grid min-h-[calc(100dvh-4rem)] place-items-center px-8">
      <div className="grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="text-display text-[clamp(3rem,6vw,5.5rem)] text-chalk">
            Internal mobility, mapped and climbed.
          </h1>
          <p className="mt-6 text-xl text-chalk/80">Prepared for {ORG.name}</p>
          <p className="mt-2 text-[15px] text-chalk/60">A demo workspace, {ORG.staff}.</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="mt-10 inline-flex h-13 items-center gap-2 rounded-[10px] bg-tape-yellow px-7 text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb63]"
          >
            Open the wall <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div aria-hidden="true" className="relative hidden h-80 lg:block">
          <Hold color="yellow" shape={1} size={84} rotate={-14} ticked className="absolute bottom-0 left-6" />
          <Hold color="yellow" shape={3} size={76} rotate={20} ticked className="absolute bottom-24 left-40" />
          <Hold color="yellow" shape={0} size={80} rotate={-30} className="absolute bottom-48 left-12" />
          <span className="tape absolute right-0 top-0 -rotate-3 text-2xl" data-tape="yellow">Top · Ready for the role</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Temporary view stubs** (each replaced in later tasks)

Create `app/demo/ncba/views/Wall.tsx`, `views/Bench.tsx`, `views/Climb.tsx`, `views/RouteBuilder.tsx`, each:

```tsx
export default function Wall() {
  return <p className="text-ink-soft">Coming in a later task.</p>;
}
```

(Rename the function to `Bench`, `Climb`, `RouteBuilder` in the matching files.)

- [ ] **Step 5: Demo root with viewer bar**

`app/demo/ncba/Demo.tsx`:

```tsx
"use client";

import { RotateCcw } from "lucide-react";
import Wordmark from "@/components/world/Wordmark";
import { ORG } from "./fixture";
import { DemoProvider, useDemo } from "./state";
import { SyntheticTag } from "./ui";
import TitleCard from "./views/TitleCard";
import Wall from "./views/Wall";
import Bench from "./views/Bench";
import Climb from "./views/Climb";
import RouteBuilder from "./views/RouteBuilder";
import type { Viewer } from "./types";

const VIEWERS: { id: Viewer; label: string }[] = [
  { id: "admin", label: "L&D admin" },
  { id: "employee", label: "Employee" },
  { id: "mentor", label: "Mentor" },
];

function Bar() {
  const { state, dispatch } = useDemo();
  return (
    <header className="wall sticky top-0 z-40 border-b border-white/8">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
        <Wordmark tone="chalk" size="sm" href="/demo/ncba" />
        <span className="hidden text-sm text-chalk/70 md:inline">{ORG.short} workspace</span>
        <span className="text-chalk"><SyntheticTag /></span>
        <div className="ml-auto flex items-center gap-4">
          {state.started && (
            <div role="radiogroup" aria-label="Viewing as" className="flex items-center gap-1 rounded-[12px] bg-white/6 p-1">
              <span className="px-2 text-sm text-chalk/60">Viewing as</span>
              {VIEWERS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={state.viewer === v.id}
                  onClick={() => dispatch({ type: "setViewer", viewer: v.id })}
                  className={`h-9 rounded-[9px] px-3 text-sm font-semibold transition-colors ${
                    state.viewer === v.id ? "bg-tape-yellow text-ink" : "text-chalk/80 hover:text-chalk"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="inline-flex h-9 items-center gap-1.5 rounded-[9px] px-3 text-sm font-semibold text-chalk/80 hover:bg-white/6 hover:text-chalk"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reset demo
          </button>
        </div>
      </div>
    </header>
  );
}

function Body() {
  const { state } = useDemo();
  if (!state.started) return <TitleCard />;
  return (
    <main className="panel min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        {state.viewer === "admin" && (
          <div className="grid gap-8">
            <Wall />
            <Bench />
          </div>
        )}
        {state.viewer === "employee" && <Climb />}
        {state.viewer === "mentor" && <RouteBuilder />}
      </div>
    </main>
  );
}

export default function Demo() {
  return (
    <DemoProvider>
      <Bar />
      <Body />
    </DemoProvider>
  );
}
```

- [ ] **Step 6: Server page**

`app/demo/ncba/page.tsx`:

```tsx
import type { Metadata } from "next";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: "NCBA demo",
  robots: { index: false, follow: false },
};

export default function NcbaDemoPage() {
  return <Demo />;
}
```

- [ ] **Step 7: Hide the marketing navbar on `/demo`**

In `components/ConditionalNavbar.tsx`, change the `OWN_CHROME` line to:

```ts
const OWN_CHROME = ["/dashboard", "/messages", "/calendar", "/profile", "/login", "/signup", "/onboarding", "/demo"];
```

- [ ] **Step 8: Verify in the browser**

Run (if the dev server isn't already running): `npx next dev -p 3100`
Open `http://localhost:3100/demo/ncba`. Expected:
- Title card on the wall: "Internal mobility, mapped and climbed.", "Prepared for National Commercial Bank of Anguilla", "A demo workspace, about 180 staff (illustrative).", "Synthetic demo data" in the bar, no marketing navbar.
- "Open the wall" shows the viewer switcher and the stub text; switching viewers changes the stub; "Reset demo" returns to the title card.

Run: `npx tsc --noEmit -p . 2>&1 | grep "app/demo\|ConditionalNavbar" || echo "clean"` → `clean`.

---

### Task 5: The wall and the bench (admin, beats 1, 2 and 5)

**Files:**
- Replace: `app/demo/ncba/views/Wall.tsx`
- Replace: `app/demo/ncba/views/Bench.tsx`

**Interfaces:**
- Consumes: `useDemo()`, `ROLES`, `SKILLS`, `roleById`, `roleCells`, `roleSummary`, `skillDemand`, `bench`, `cellState`, `personGap`, `SkillCell`, `LevelTag`, `skillName`.
- Produces: rendered test hooks used by Task 8:
  - `data-testid="callout"` on the demand callout.
  - Role row buttons with accessible names starting with the role title (e.g. `Compliance / AML Officer`).
  - `data-testid="bench-row"` on each near-ready person row.
  - `data-testid="climber-row"` on each climbing person row.
  - `data-testid="cell-<personId>-<skillId>"` on each person cell in the bench (via `SkillCell testId`).

- [ ] **Step 1: Wall view**

`app/demo/ncba/views/Wall.tsx`:

```tsx
"use client";

import { ROLES, SKILLS } from "../fixture";
import { roleCells, roleSummary, skillDemand } from "../gap";
import { useDemo } from "../state";
import { LevelTag, skillName } from "../ui";

export default function Wall() {
  const { state, dispatch } = useDemo();
  const demand = skillDemand(ROLES, state.people, SKILLS);
  const top = demand[0];
  const changed = state.lastChange?.skill;

  return (
    <section aria-labelledby="wall-h" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="wall-h" className="text-[clamp(2rem,3.6vw,2.8rem)]">The wall</h1>
          <p className="mt-2 max-w-[60ch] text-[17px] text-ink-soft">
            Roles open to internal movers, and how much of each required skill the bank already holds.
          </p>
        </div>
        {top && (
          <p data-testid="callout" className="route-card max-w-md p-4 text-[15px]">
            <span className="font-bold">{skillName(top.skill)}</span> is required by{" "}
            <span className="tabular font-bold">{top.roles} roles</span>.{" "}
            <span className="tabular font-bold">{top.verifiedHolders} people</span> hold it, mentor-verified.
          </p>
        )}
      </div>

      <ul className="grid gap-3">
        {ROLES.map((role) => {
          const s = roleSummary(role, state.people);
          const cells = roleCells(role, state.people);
          const selected = state.selectedRoleId === role.id;
          return (
            <li key={role.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "selectRole", roleId: role.id })}
                aria-pressed={selected}
                className={`route-card grid w-full gap-4 p-5 text-left transition-shadow lg:grid-cols-[16rem_1fr] ${
                  selected ? "ring-2 ring-tape-blue" : "hover:shadow-[var(--shadow-lift)]"
                }`}
              >
                <span>
                  <span className="block text-lg font-extrabold tracking-tight">{role.title}</span>
                  <span className="tabular mt-1 block text-sm text-ink-soft">
                    {s.ready} ready · {s.climbing} climbing · {s.bench} within two skills
                  </span>
                </span>
                <span className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                  {cells.map((c) => (
                    <span
                      key={c.skill}
                      className={`rounded-[10px] border p-2.5 ${changed === c.skill ? "border-tape-blue" : "border-ink/8"}`}
                    >
                      <span className="flex items-center justify-between gap-2 text-[13px] font-semibold">
                        {skillName(c.skill)} <LevelTag level={c.need} />
                      </span>
                      <span className="tabular mt-1.5 block text-xs text-ink-soft">
                        <span className="font-bold text-ink">{c.verified}</span> verified · {c.unverified} self-declared
                      </span>
                    </span>
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <details className="route-card p-5">
        <summary className="cursor-pointer text-lg font-bold">Skill view: where to invest</summary>
        <table className="mt-4 w-full text-left text-[15px]">
          <thead className="text-sm text-ink-soft">
            <tr><th className="py-2 font-semibold">Skill</th><th className="font-semibold">Roles that need it</th><th className="font-semibold">Mentor-verified holders</th></tr>
          </thead>
          <tbody>
            {demand.map((d) => (
              <tr key={d.skill} className="border-t border-ink/8">
                <td className="py-2 font-semibold">{skillName(d.skill)}</td>
                <td className="tabular">{d.roles}</td>
                <td className="tabular">{d.verifiedHolders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
```

- [ ] **Step 2: Bench view**

`app/demo/ncba/views/Bench.tsx`:

```tsx
"use client";

import { roleById } from "../fixture";
import { bench, cellState, personGap } from "../gap";
import { useDemo } from "../state";
import { LevelTag, SkillCell, skillName } from "../ui";
import type { Person, Role } from "../types";

function PeopleTable({ role, people, rowTestId, lastChange }: {
  role: Role;
  people: { person: Person; open: number }[];
  rowTestId: string;
  lastChange: { personId: string; skill: string } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="text-sm text-ink-soft">
            <th className="py-2 pr-4 font-semibold">Person</th>
            {role.reqs.map((r) => (
              <th key={r.skill} className="px-1 font-semibold">
                <span className="flex items-center gap-1.5 text-[13px]">{skillName(r.skill)} <LevelTag level={r.level} /></span>
              </th>
            ))}
            <th className="pl-2 font-semibold">Open</th>
          </tr>
        </thead>
        <tbody>
          {people.map(({ person, open }) => (
            <tr key={person.id} data-testid={rowTestId} className="border-t border-ink/8">
              <td className="py-2.5 pr-4">
                <span className="block font-semibold">{person.name}</span>
                <span className="block text-sm text-ink-soft">{person.title} · {person.team}</span>
              </td>
              {role.reqs.map((r) => {
                const g = personGap(person, role).find((x) => x.skill === r.skill)!;
                return (
                  <td key={r.skill} className="px-1">
                    <SkillCell
                      testId={`cell-${person.id}-${r.skill}`}
                      state={cellState(person, r.skill, r.level)}
                      have={g.have}
                      need={r.level}
                      highlight={lastChange?.personId === person.id && lastChange.skill === r.skill}
                    />
                  </td>
                );
              })}
              <td className="tabular pl-2 font-bold">{open}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Bench() {
  const { state } = useDemo();
  const role = roleById(state.selectedRoleId);
  const climbers = state.people
    .filter((p) => p.targetRoleId === role.id)
    .map((person) => ({ person, open: personGap(person, role).filter((g) => g.open).length }));
  const near = bench(role, state.people).filter((e) => e.person.targetRoleId !== role.id);

  return (
    <section aria-labelledby="bench-h" className="route-card grid gap-6 p-6">
      <div>
        <h2 id="bench-h" className="text-2xl font-extrabold tracking-tight">{role.title}: the bench</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          Solid cells are mentor-verified. Hatched cells are self-declared or imported, not yet verified.
        </p>
      </div>
      <div>
        <h3 className="mb-2 font-bold">Climbing toward this role</h3>
        {climbers.length ? (
          <PeopleTable role={role} people={climbers} rowTestId="climber-row" lastChange={state.lastChange} />
        ) : (
          <p className="text-[15px] text-ink-soft">No one is climbing toward this role yet.</p>
        )}
      </div>
      <div>
        <h3 className="mb-2 font-bold">Within two skills of ready</h3>
        {near.length ? (
          <PeopleTable role={role} people={near} rowTestId="bench-row" lastChange={state.lastChange} />
        ) : (
          <p className="text-[15px] text-ink-soft">No one is within two skills of this role yet.</p>
        )}
      </div>
    </section>
  );
}
```

Note: the bench list excludes people already climbing toward the role, so each person appears once. The fixture test in Task 2 counts `bench()` directly, and the four Compliance bench people have no `targetRoleId`, so the UI shows the same four rows.

- [ ] **Step 3: Verify in the browser**

Open `http://localhost:3100/demo/ncba`, click "Open the wall". Expected:
- Callout reads "AML/KYC is required by 3 roles. 4 people hold it, mentor-verified."
- Five role rows with summary lines and skill cells.
- Credit Analyst is selected by default; the bench shows Keisha and Trevor under "Climbing", with Keisha's Financial statements cell hatched showing "1".
- Clicking "Compliance / AML Officer" shows exactly 4 rows under "Within two skills of ready".
- "Skill view" opens a table ranked with AML/KYC first.

Run: `npx tsc --noEmit -p . 2>&1 | grep "app/demo" || echo "clean"` → `clean`.

---

### Task 6: The climb (employee, beat 3)

**Files:**
- Replace: `app/demo/ncba/views/Climb.tsx`

**Interfaces:**
- Consumes: `useDemo()`, `ROLES`, `roleById`, `personGap`, `suggestMentors`, `Hold` (`@/components/world/Hold`), `Person` component (`@/components/world/Person`, default export, props `name`, `src`, `size`), `Button`, `LevelTag`, `skillName`.
- Produces: an employee picker `<select>` labelled "Viewing employee"; a target role picker `<select>` labelled "Target role" (shown when the person has no target); a "Request <First name>" button per suggestion; the confirmation text `Your manager has been notified.`

- [ ] **Step 1: Climb view**

`app/demo/ncba/views/Climb.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Hold from "@/components/world/Hold";
import PersonFace from "@/components/world/Person";
import { Button } from "@/components/ui/button";
import { ROLES, roleById } from "../fixture";
import { personGap, suggestMentors } from "../gap";
import { useDemo } from "../state";
import { LevelTag, skillName } from "../ui";

const first = (name: string) => name.split(" ")[0];

export default function Climb() {
  const { state, dispatch } = useDemo();
  const person = state.people.find((p) => p.id === state.employeeId) ?? state.people[0];
  const [pickedRole, setPickedRole] = useState(ROLES[0].id);
  const roleId = person.targetRoleId ?? pickedRole;
  const role = roleById(roleId);
  const gap = personGap(person, role);
  const open = gap.filter((g) => g.open);
  const route = state.routes[person.id];
  const suggestions = suggestMentors(person, role, state.people).slice(0, 4);
  const eligible = state.people.filter((p) => p.roleId === undefined);

  return (
    <section aria-labelledby="climb-h" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="climb-h" className="text-[clamp(2rem,3.6vw,2.8rem)]">{person.name}</h1>
          <p className="mt-1 text-[17px] text-ink-soft">{person.title} · {person.team}</p>
        </div>
        <label className="grid gap-1 text-sm font-semibold">
          Viewing employee
          <select
            value={person.id}
            onChange={(e) => dispatch({ type: "selectEmployee", personId: e.target.value })}
            className="h-10 rounded-[10px] border border-input bg-card px-3 text-[15px] font-normal"
          >
            {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>

      <div className="wall rounded-[18px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-display text-[clamp(1.6rem,3vw,2.2rem)]">Toward {role.title}</h2>
          {!person.targetRoleId && (
            <label className="flex items-center gap-2 text-sm text-chalk/80">
              Target role
              <select
                value={pickedRole}
                onChange={(e) => setPickedRole(e.target.value)}
                className="h-9 rounded-[8px] border border-white/20 bg-wall-deep px-2 text-chalk"
              >
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </label>
          )}
        </div>
        <p className="mt-2 text-chalk/75">
          {open.length === 0 ? "Every required skill is held. Ready for this role once verified." : `${open.length} of ${gap.length} skills to go.`}
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {gap.map((g, i) => (
            <li key={g.skill} className="flex items-center gap-3 rounded-[12px] bg-white/5 p-3">
              <Hold
                color="yellow"
                shape={i}
                size={40}
                rotate={(i * 37) % 60 - 30}
                ticked={!g.open && g.source === "verified"}
                className={g.open ? "opacity-45 grayscale brightness-[2.2]" : ""}
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-chalk">{skillName(g.skill)}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-chalk/70">
                  {g.open ? <>Have L{g.have}, need <LevelTag level={g.need} /></> : g.source === "verified" ? "Verified" : "Self-declared"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="route-card p-6">
        <h2 className="text-xl font-extrabold tracking-tight">Mentors who can get you there</h2>
        <p className="mt-1 text-[15px] text-ink-soft">Ranked by who has made this move, then by how many of your gap skills they hold, verified.</p>
        {route ? (
          <p className="mt-5 flex items-center gap-2 rounded-[10px] bg-tape-green-soft px-4 py-3 text-[15px] font-semibold text-green-800">
            <Check className="size-4" aria-hidden="true" />
            Request sent to {state.people.find((p) => p.id === route.mentorId)?.name}. Your manager has been notified.
          </p>
        ) : suggestions.length === 0 ? (
          <p className="mt-5 text-[15px] text-ink-soft">No colleague holds these gap skills verified yet.</p>
        ) : (
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.mentor.id} className="flex items-center gap-4 rounded-[12px] border border-ink/8 p-4">
                <PersonFace name={s.mentor.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{s.mentor.name}</p>
                  <p className="text-sm text-ink-soft">
                    {s.mentor.title}
                    {s.madeMove && s.mentor.madeMove ? ` · moved from ${s.mentor.madeMove.from} in ${s.mentor.madeMove.year}` : ""}
                  </p>
                  <p className="mt-1 text-sm">Holds {s.covers.length} of your {open.length} gap skills</p>
                </div>
                <Button
                  variant="tape"
                  size="sm"
                  onClick={() => dispatch({ type: "requestMentor", personId: person.id, mentorId: s.mentor.id, roleId: role.id })}
                >
                  Request {first(s.mentor.name)}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in the browser**

Switch to "Employee". Expected:
- "Keisha Brooks", "Customer Service Representative · Customer Service", "Toward Credit Analyst", "4 of 5 skills to go."
- Credit analysis and Financial statements show "Have L1, need L2"; Excel modelling "Have L0, need L2"; Risk rating "Have L0, need L1"; Report writing "Self-declared".
- Andre Hughes first, "moved from Teller in 2023", "Holds 4 of your 4 gap skills".
- Clicking "Request Andre" replaces the list with "Request sent to Andre Hughes. Your manager has been notified."
- Picking Kimberly Lloyd (no target) shows the "Target role" picker; changing it updates her gap with no errors.

---

### Task 7: The route (mentor, beat 4)

**Files:**
- Replace: `app/demo/ncba/views/RouteBuilder.tsx`

**Interfaces:**
- Consumes: `useDemo()`, `roleById`, `canVerify`, `grade`, `Hold`, `Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogFooter` (`@/components/ui/dialog`), `Button`, `Input` (`@/components/ui/input`), `skillName`.
- Produces: `data-testid="milestone"` per milestone row; a "Mark reached" button per open milestone; dialog title text `Confirm <First name> can now do <Skill> at level <N>?` with "Confirm" and "Not yet" buttons.

- [ ] **Step 1: Route builder view**

`app/demo/ncba/views/RouteBuilder.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import Hold from "@/components/world/Hold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { roleById } from "../fixture";
import { canVerify, grade } from "../gap";
import { useDemo } from "../state";
import { skillName } from "../ui";
import type { Milestone } from "../types";

const first = (name: string) => name.split(" ")[0];

export default function RouteBuilder() {
  const { state, dispatch } = useDemo();
  const route = state.routes[state.employeeId] ?? Object.values(state.routes)[0];
  const [confirming, setConfirming] = useState<Milestone | null>(null);

  if (!route) {
    return (
      <div className="route-card grid justify-items-start gap-3 p-8">
        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)]">No route to set yet</h1>
        <p className="text-[17px] text-ink-soft">A route appears here once an employee requests this mentor.</p>
        <Button variant="tape" onClick={() => dispatch({ type: "setViewer", viewer: "employee" })}>View as the employee</Button>
      </div>
    );
  }

  const mentee = state.people.find((p) => p.id === route.personId)!;
  const mentor = state.people.find((p) => p.id === route.mentorId)!;
  const role = roleById(route.roleId);
  const n = route.milestones.length;
  const allowed = confirming ? canVerify(mentor, confirming.skill, confirming.level) : false;

  return (
    <section aria-labelledby="route-h" className="grid gap-6">
      <div className="wall rounded-[18px] p-6 sm:p-8">
        <h1 id="route-h" className="text-[clamp(1.9rem,3.6vw,2.8rem)]" style={{ color: "var(--color-chalk)" }}>
          {first(mentee.name)}&apos;s route to {role.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="tape text-sm" data-tape="chalk">Set by {mentor.name}</span>
          <span className="text-sm text-chalk/70">Drafted from {first(mentee.name)}&apos;s gap. Reorder or rename, then verify as each skill lands.</span>
        </div>
      </div>

      <ol className="grid gap-3">
        {route.milestones.map((m, i) => (
          <li key={m.id} data-testid="milestone" className={`route-card flex flex-wrap items-center gap-4 p-4 ${m.reached ? "" : "bg-card"}`}>
            <span className="tabular w-12 rounded-[4px] bg-ink px-1.5 py-0.5 text-center text-xs font-bold text-tape-yellow">{grade(i)}</span>
            <Hold color="yellow" shape={i} size={40} rotate={(i * 37) % 60 - 30} ticked={m.reached} className={m.reached ? "" : "opacity-45 grayscale"} />
            <label className="min-w-[16rem] flex-1">
              <span className="sr-only">Milestone title</span>
              <Input
                defaultValue={m.title}
                onBlur={(e) => dispatch({ type: "rename", personId: route.personId, milestoneId: m.id, title: e.target.value })}
                className="h-10 font-semibold"
              />
            </label>
            <span className="text-sm text-ink-soft">{skillName(m.skill)} · level {m.level}</span>
            <span className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label={`Move ${m.title} up`} disabled={i === 0}
                onClick={() => dispatch({ type: "move", personId: route.personId, from: i, to: i - 1 })}>
                <ArrowUp />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Move ${m.title} down`} disabled={i === n - 1}
                onClick={() => dispatch({ type: "move", personId: route.personId, from: i, to: i + 1 })}>
                <ArrowDown />
              </Button>
            </span>
            {m.reached ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-tape-green-soft px-3 py-1 text-sm font-semibold text-green-800">
                <Check className="size-4" aria-hidden="true" /> Verified
              </span>
            ) : (
              <Button variant="tape" size="sm" onClick={() => setConfirming(m)}>Mark reached</Button>
            )}
          </li>
        ))}
        <li className="flex items-center gap-3 px-4 pt-2">
          <span className="tape text-base" data-tape="yellow">Top · Ready for {role.title}</span>
        </li>
      </ol>

      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          {confirming && (
            <>
              <DialogTitle className="text-xl font-extrabold">
                Confirm {first(mentee.name)} can now do {skillName(confirming.skill)} at level {confirming.level}?
              </DialogTitle>
              <DialogDescription className="text-ink-soft">
                {allowed
                  ? "This marks the skill as mentor-verified on the wall."
                  : `You can only verify skills you hold, verified, at level ${confirming.level} or above.`}
              </DialogDescription>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConfirming(null)}>Not yet</Button>
                <Button
                  variant="tape"
                  disabled={!allowed}
                  onClick={() => {
                    dispatch({ type: "verify", personId: route.personId, milestoneId: confirming.id });
                    setConfirming(null);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
```

- [ ] **Step 2: Verify in the browser**

From the title card: Open the wall → Employee → Request Andre → Mentor. Expected:
- "Keisha's route to Credit Analyst", "Set by Andre Hughes" tape, four milestones graded Start, V1, V2, V3, then the Top tag.
- The first milestone's up arrow and the last milestone's down arrow are disabled.
- "Mark reached" on "Reading financial statements" opens "Confirm Keisha can now do Financial statements at level 2?"; "Not yet" closes it with no change; "Confirm" turns the row "Verified" with a chalk-ticked hold.
- Admin view: the Credit Analyst bench shows Keisha's Financial statements cell solid "2" with a blue ring, and the Credit Analyst "Financial statements" cell's verified count is one higher than before.

---

### Task 8: End-to-end walkthrough and visual check

**Files:**
- Modify: `package.json` (devDependency and script)
- Create: `playwright.config.ts`
- Create: `e2e/ncba-demo.spec.ts`

**Interfaces:**
- Consumes: the test hooks produced in Tasks 4 to 7.
- Produces: `npm run test:e2e`.

- [ ] **Step 1: Install Playwright test runner**

Run: `npm install -D @playwright/test@1.61.0`
(Chromium for 1.61 is already cached under `~/Library/Caches/ms-playwright`. If Playwright reports a missing browser, run `npx playwright install chromium`.)

Add to `package.json` `"scripts"`:

```json
"test:e2e": "playwright test"
```

Append to `.gitignore`:

```
# Playwright
/test-results
/playwright-report
```

- [ ] **Step 2: Config**

`playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3100", viewport: { width: 1440, height: 900 } },
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100/demo/ncba",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

Jest only matches `__tests__/**/*.test.ts(x)`, so `e2e/*.spec.ts` stays out of `npm test`.

- [ ] **Step 3: Write the walkthrough test**

`e2e/ncba-demo.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("NCBA demo: wall, bench, climb, route, verify, payoff, reset", async ({ page }) => {
  await page.goto("/demo/ncba");

  // Beat 0
  await expect(page.getByText("Prepared for National Commercial Bank of Anguilla")).toBeVisible();
  await expect(page.getByText("Synthetic demo data")).toBeVisible();
  await page.getByRole("button", { name: "Open the wall" }).click();

  // Beat 1
  const callout = page.getByTestId("callout");
  await expect(callout).toContainText("AML/KYC");
  await expect(callout).toContainText("3 roles");
  await expect(callout).toContainText("4 people");

  // Beat 2
  await page.getByRole("button", { name: /^Compliance \/ AML Officer/ }).click();
  await expect(page.getByTestId("bench-row")).toHaveCount(4);

  // Keisha's cell before verification
  await page.getByRole("button", { name: /^Credit Analyst/ }).click();
  await expect(page.getByTestId("cell-keisha-fin_statements")).toHaveAttribute("data-state", "short");

  // Beat 3
  await page.getByRole("radio", { name: "Employee" }).click();
  await expect(page.getByRole("heading", { name: "Keisha Brooks" })).toBeVisible();
  await page.getByRole("button", { name: "Request Andre" }).click();
  await expect(page.getByText("Your manager has been notified.")).toBeVisible();

  // Beat 4
  await page.getByRole("radio", { name: "Mentor" }).click();
  await expect(page.getByTestId("milestone")).toHaveCount(4);
  const fin = page.getByTestId("milestone").filter({ hasText: "Financial statements · level 2" });
  await fin.getByRole("button", { name: "Mark reached" }).click();
  await expect(page.getByText("Confirm Keisha can now do Financial statements at level 2?")).toBeVisible();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(fin.getByText("Verified")).toBeVisible();

  // Beat 5
  await page.getByRole("radio", { name: "L&D admin" }).click();
  await page.getByRole("button", { name: /^Credit Analyst/ }).click();
  await expect(page.getByTestId("cell-keisha-fin_statements")).toHaveAttribute("data-state", "verified");

  // Reset
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("button", { name: "Open the wall" })).toBeVisible();
});
```

- [ ] **Step 4: Run it**

Run: `npm run test:e2e`
Expected: `1 passed`.

- [ ] **Step 5: Visual check at 1440 and 1024**

Run:

```bash
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch();
  for (const w of [1440, 1024]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto("http://localhost:3100/demo/ncba");
    await p.screenshot({ path: `test-results/ncba-title-${w}.png` });
    await p.getByRole("button", { name: "Open the wall" }).click();
    await p.screenshot({ path: `test-results/ncba-wall-${w}.png`, fullPage: true });
    console.log(w, "horizontal overflow:", await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  }
  await b.close();
})();'
```

Expected: `horizontal overflow: false` at both widths. Open the four screenshots and check that no text is clipped, the viewer bar fits on one line at 1024, and the "Synthetic demo data" tag is visible on the title card and the wall.

- [ ] **Step 6: Full checks**

Run: `npx jest __tests__/demo` → all pass.
Run: `npx tsc --noEmit -p . 2>&1 | grep -v __tests__/api | grep error || echo "clean"` → `clean`.
Run: `npm run build` → completes; `/demo/ncba` appears in the route list.
