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
        <h1 className="text-display text-[clamp(1.8rem,3vw,2.4rem)]">No route to set yet</h1>
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
        <h1 id="route-h" className="text-display text-[clamp(1.9rem,3.6vw,2.8rem)]" style={{ color: "var(--color-chalk)" }}>
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
