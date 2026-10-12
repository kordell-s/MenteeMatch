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
