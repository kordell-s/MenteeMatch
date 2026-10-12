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
          <h1 id="wall-h" className="text-display text-[clamp(2rem,3.6vw,2.8rem)]">The wall</h1>
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
                        <span className="font-bold text-ink">{c.verified}</span> verified · {c.unverified} not yet verified
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
