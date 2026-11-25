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
  const near = bench(role, state.people);

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
