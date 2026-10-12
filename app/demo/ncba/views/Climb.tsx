"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Hold from "@/components/world/Hold";
import PersonFace from "@/components/world/Person";
import { Button } from "@/components/ui/button";
import { ROLES, roleById } from "../fixture";
import { personGap, suggestMentors } from "../gap";
import { useDemo } from "../state";
import { HATCH, LevelTag, skillName, sourceLabel } from "../ui";

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
          <h1 id="climb-h" className="text-display text-[clamp(2rem,3.6vw,2.8rem)]">{person.name}</h1>
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
            <li
              key={g.skill}
              className="flex items-center gap-3 rounded-[12px] bg-white/5 p-3"
              style={!g.open && g.source !== "verified" ? { backgroundImage: HATCH.replace("rgb(23 25 28 / 0.18)", "rgb(244 245 242 / 0.12)") } : undefined}
            >
              <Hold
                color="yellow"
                shape={i}
                size={40}
                rotate={(i * 37) % 60 - 30}
                ticked={!g.open}
                className={g.open ? "opacity-45 grayscale brightness-[2.2]" : ""}
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-chalk">{skillName(g.skill)}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-chalk/70">
                  {g.open ? <>Have L{g.have}, need <LevelTag level={g.need} /></> : g.source ? sourceLabel(g.source) : ""}
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
