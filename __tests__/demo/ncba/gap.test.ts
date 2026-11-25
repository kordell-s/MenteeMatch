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
    // bench: empty and halfway are two skills short; the climber is counted under climbing, not bench
    expect(roleSummary(role, people)).toEqual({ ready: 1, climbing: 1, bench: 2 });
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
