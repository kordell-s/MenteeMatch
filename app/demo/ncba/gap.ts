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

/** People within maxGap skills of the role who aren't already climbing toward it (climbers are listed separately). */
export function bench(role: Role, people: Person[], maxGap = 2): BenchEntry[] {
  return outsiders(role, people)
    .filter((p) => p.targetRoleId !== role.id)
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
