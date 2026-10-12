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

  it("the wall's 'within two skills' count matches the bench list, which excludes people already climbing", () => {
    for (const r of ROLES) {
      const listed = bench(r, PEOPLE);
      expect(listed.every((e) => e.person.targetRoleId !== r.id)).toBe(true);
      expect(roleSummary(r, PEOPLE).bench).toBe(listed.length);
    }
  });
});
