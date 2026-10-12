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
