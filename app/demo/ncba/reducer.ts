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
