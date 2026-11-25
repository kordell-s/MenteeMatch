"use client";

import { useState } from "react";
import Hold, { type TapeColor } from "@/components/world/Hold";

type Step = { t: string; w: string; done?: boolean; now?: boolean; c: TapeColor };

// Illustrative routes from three different fields. Not real mentees.
const ROUTES: { id: string; field: string; title: string; steps: Step[] }[] = [
  {
    id: "pilot",
    field: "Aviation",
    title: "Commercial pilot, first year",
    steps: [
      { t: "Medical certificate & ground school", w: "Months 1-2", done: true, c: "green" },
      { t: "Private pilot licence checkride", w: "Months 3-5", done: true, c: "yellow" },
      { t: "Instrument rating", w: "Months 6-8", now: true, c: "blue" },
      { t: "Build hours toward commercial", w: "Months 9-11", c: "pink" },
      { t: "Airline résumé & interviews", w: "Month 12", c: "yellow" },
    ],
  },
  {
    id: "analyst",
    field: "Business",
    title: "Business analyst, 12 weeks",
    steps: [
      { t: "Excel & SQL fundamentals", w: "Weeks 1-2", done: true, c: "green" },
      { t: "Reading financial statements", w: "Weeks 3-4", done: true, c: "yellow" },
      { t: "Case study project", w: "Weeks 5-8", now: true, c: "blue" },
      { t: "Résumé & LinkedIn review", w: "Weeks 9-10", c: "pink" },
      { t: "Case interview practice", w: "Weeks 11-12", c: "yellow" },
    ],
  },
  {
    id: "frontend",
    field: "Tech",
    title: "Frontend developer, 12 weeks",
    steps: [
      { t: "HTML, CSS & Git basics", w: "Weeks 1-2", done: true, c: "green" },
      { t: "JavaScript foundations", w: "Weeks 3-4", done: true, c: "yellow" },
      { t: "Build a React app", w: "Weeks 5-7", now: true, c: "blue" },
      { t: "Ship a portfolio project", w: "Weeks 8-10", c: "pink" },
      { t: "Mock interviews", w: "Weeks 11-12", c: "yellow" },
    ],
  },
];

export default function ExampleRoutes() {
  const [active, setActive] = useState(ROUTES[0].id);
  const route = ROUTES.find((r) => r.id === active)!;

  return (
    <div>
      <div role="tablist" aria-label="Example routes by field" className="mb-4 flex flex-wrap gap-2">
        {ROUTES.map((r) => (
          <button
            key={r.id}
            role="tab"
            type="button"
            id={`tab-${r.id}`}
            aria-selected={r.id === active}
            aria-controls="example-route"
            onClick={() => setActive(r.id)}
            className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
              r.id === active ? "bg-chalk text-ink" : "text-chalk/75 ring-1 ring-chalk/25 hover:text-chalk hover:ring-chalk/60"
            }`}
          >
            {r.field}
          </button>
        ))}
      </div>

      <figure
        id="example-route"
        role="tabpanel"
        aria-labelledby={`tab-${route.id}`}
        className="route-card rotate-[1.2deg] p-6 text-ink sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-2xl font-extrabold tracking-tight">{route.title}</p>
          <span className="tape text-base" data-tape="yellow">Set by your mentor</span>
        </div>
        <ol className="mt-7 grid gap-2.5">
          {route.steps.map((m, i) => (
            <li
              key={m.t}
              className={`flex items-center gap-4 rounded-[10px] px-3 py-2.5 ${
                m.now ? "bg-tape-blue-soft" : m.done ? "" : "border border-dashed border-ink/15"
              }`}
            >
              <Hold color="yellow" shape={i} size={36} rotate={(i * 37) % 60 - 30} ticked={m.done} className={m.done || m.now ? "" : "opacity-35 grayscale"} />
              <span className="tabular w-9 shrink-0 rounded-[4px] bg-ink px-1 py-0.5 text-center text-xs font-bold text-tape-yellow">{i === 0 ? "Start" : `V${i}`}</span>
              <span className={`flex-1 font-semibold ${m.done ? "text-ink-soft line-through decoration-ink/30" : ""}`}>
                {m.t}
              </span>
              <span className="tabular shrink-0 text-sm text-ink-soft">{m.now ? "You're here" : m.w}</span>
            </li>
          ))}
        </ol>
        <figcaption className="mt-5 text-sm text-ink-soft">
          An illustrative route. Each milestone carries its own tasks, resources and weekly check-ins.
        </figcaption>
      </figure>
    </div>
  );
}
