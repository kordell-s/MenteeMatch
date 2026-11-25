"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Check } from "lucide-react";
import RouteWall, { ROUTE } from "./RouteWall";
import ExampleRoutes from "./ExampleRoutes";
import SetterTag from "./SetterTag";
import Traverse from "./Traverse";
import Hold from "@/components/world/Hold";
import { SKILL_GROUPS, skillLabel, skillOverlap } from "@/lib/skills";

export type PublicMentor = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  skills: string[];
  profilePicture: string | null;
  bio: string;
  category: string;
};

const QUICK = ["INTERVIEW_PREP", "FINANCE", "PILOT_TRAINING", "REACT", "UX", "DIGITAL_MARKETING", "DATA_SCIENCE", "RESUME_REVIEW"];

export default function Landing({ mentors }: { mentors: PublicMentor[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const matchesRef = useRef<HTMLElement>(null);

  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length >= 6 ? p : [...p, s]));

  const ranked = useMemo(() => {
    const rows = mentors.map((m) => ({ m, ...skillOverlap(picked, m.skills) }));
    if (picked.length === 0) {
      // Before any pick, deal one mentor per field in turn so the wall shows its range.
      const byField = new Map<string, typeof rows>();
      rows.forEach((r) => byField.set(r.m.category, [...(byField.get(r.m.category) ?? []), r]));
      const LEAD = ["AVIATION", "BUSINESS", "TECHNOLOGY", "HEALTH", "DESIGN", "MARKETING", "CREATIVE", "MUSIC"];
      const queues = [...byField.entries()]
        .sort(([a], [b]) => (LEAD.indexOf(a) + 1 || 99) - (LEAD.indexOf(b) + 1 || 99))
        .map(([, q]) => q);
      const mixed: typeof rows = [];
      while (queues.some((q) => q.length)) queues.forEach((q) => q.length && mixed.push(q.shift()!));
      return mixed;
    }
    return rows.filter((r) => r.shared.length > 0).sort((a, b) => b.score - a.score);
  }, [mentors, picked]);

  const findMatches = () => {
    matchesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const signupHref = picked.length
    ? `/signup?skills=${encodeURIComponent(picked.join(","))}`
    : "/signup";

  return (
    <div className="wall wall-panels">
      {/* First viewport: the wall, the route, and the start hold. */}
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 lg:pb-10 lg:pt-14">
        <div className="flex flex-col justify-center">
          <h1 className="text-display max-w-[11ch] text-[clamp(2.6rem,6.1vw,5.4rem)] text-chalk">
            Your mentor sets the route.
          </h1>
          <ol className="mt-5 grid gap-2 lg:hidden" aria-label="An example route a mentor might set">
            <li>
              <span className="tape -rotate-2 px-3 py-1.5 text-base" data-tape="yellow">Top · First offer</span>
            </li>
            {[...ROUTE].reverse().slice(0, 2).map((s, i) => (
              <li key={s.label} className={`flex items-center gap-2.5 ${i % 2 ? "pl-10" : "pl-3"}`}>
                <Hold color="yellow" shape={s.shape} rotate={s.rotate} size={34} />
                <span className="tape text-[13px]" data-tape="chalk">
                  <span className="rounded-[3px] bg-ink px-1 py-px font-sans text-xs font-bold text-tape-yellow">{s.grade}</span>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-chalk/80 sm:mt-6 sm:text-xl">
            Get matched with a mentor in your field who shares your skills. They build you a step-by-step plan to your first role.
          </p>

          <div className="mt-7 sm:mt-10" role="group" aria-labelledby="start-hold">
            <h2 id="start-hold" className="text-sm font-semibold text-chalk">
              What are you working on? <span className="font-normal text-chalk/60">Pick up to 6.</span>
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(showAll ? SKILL_GROUPS.flatMap((g) => g.skills) : QUICK).map((s) => {
                const on = picked.includes(s);
                return (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => toggle(s)}
                      aria-pressed={on}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold transition-[background-color,border-color,color] duration-200 ${
                        on
                          ? "border-tape-yellow bg-tape-yellow text-ink"
                          : "border-chalk/25 text-chalk hover:border-chalk/60"
                      }`}
                    >
                      {on && <Check className="size-4" aria-hidden="true" />}
                      {skillLabel(s)}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-chalk/70 underline-offset-4 hover:text-chalk hover:underline"
                >
                  {!showAll && <Plus className="size-4" aria-hidden="true" />}
                  {showAll ? "Fewer skills" : "All skills"}
                </button>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={findMatches}
                className="inline-flex h-13 items-center gap-2 rounded-[10px] bg-tape-yellow px-6 text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] transition-[background-color,transform,opacity] duration-200 hover:bg-[#ffdb63] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Find my mentors <ArrowRight className="size-5" aria-hidden="true" />
              </button>
              <p className="text-sm text-chalk/70" aria-live="polite">
                {picked.length === 0
                  ? `${mentors.length} mentors on the wall`
                  : `${ranked.length} ${ranked.length === 1 ? "mentor shares" : "mentors share"} your skills`}
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <RouteWall />
        </div>
      </section>

      {/* Matches: real mentors, ranked by shared skills. */}
      <section
        ref={matchesRef}
        id="matches"
        aria-labelledby="matches-title"
        className="scroll-mt-20 border-t border-white/8 bg-wall-deep/60"
      >
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 lg:py-28">
          <h2 id="matches-title" className="text-display max-w-[16ch] text-[clamp(2.2rem,4.6vw,3.75rem)]">
            {picked.length ? "Mentors who share your skills" : "Mentors on the wall right now"}
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg text-chalk/75">
            {picked.length
              ? "Ranked by how much of your skill set overlaps with theirs. Shared skills are taped in yellow."
              : "Pick a few skills above and we'll rank them by how much you have in common."}
          </p>

          {ranked.length === 0 ? (
            <div className="mt-12 rounded-[14px] border border-dashed border-chalk/25 p-10 text-center">
              <p className="text-lg font-semibold">No mentor shares those skills yet.</p>
              <p className="mt-2 text-chalk/70">Try a broader skill, or sign up and we&apos;ll match you as mentors join.</p>
            </div>
          ) : (
            <ul className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {ranked.slice(0, 6).map(({ m, shared, score }, i) => (
                <li key={m.id} className={i >= 3 ? "hidden md:block" : ""}>
                  <SetterTag m={m} shared={shared} score={score} picked={picked.length > 0} tilt={[-0.8, 0.6, -0.4, 0.9, -0.6, 0.5][i]} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={signupHref}
              className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-tape-yellow px-6 text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb63]"
            >
              Get started <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/browse" className="text-[15px] font-semibold text-chalk underline decoration-chalk/40 decoration-2 underline-offset-4 hover:decoration-chalk">
              Browse every mentor
            </Link>
          </div>
        </div>
      </section>

      {/* How it works: one traverse across the wall. */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 lg:py-28">
          <h2 id="how-title" className="text-display max-w-[18ch] text-[clamp(2.2rem,4.6vw,3.75rem)]">
            Mentorship with a route, not a one-off call.
          </h2>
          <Traverse />
        </div>
      </section>

      {/* What a route holds: one laminated route card. */}
      <section aria-labelledby="route-title" className="border-y border-white/8 bg-wall-deep/60">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:py-28">
          <div>
            <h2 id="route-title" className="text-display max-w-[14ch] text-[clamp(2.2rem,4.6vw,3.75rem)]">
              You always know the next hold.
            </h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-chalk/75">
              Whatever the field, each route is graded and in order. Finished milestones get a tick, and the ones ahead stay on the card so the whole climb is in view.
            </p>
          </div>

          <ExampleRoutes />
        </div>
      </section>

      {/* For mentors. */}
      <section aria-labelledby="mentor-title">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-8 lg:py-32">
          <h2 id="mentor-title" className="text-display text-[clamp(2.6rem,7vw,5.5rem)]">
            Been up this wall?
            <br />
            <span className="text-tape-yellow">Set a route for someone.</span>
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-chalk/75">
            Mentors pick who they take on, build roadmaps from a guided template and see every mentee&apos;s progress in one place.
          </p>
          <Link
            href="/signup?role=mentor"
            className="mt-10 inline-flex h-12 items-center gap-2 rounded-[10px] border-2 border-chalk px-6 text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-ink"
          >
            Become a mentor <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Close: the top-out. */}
      <section aria-labelledby="close-title" className="border-t border-white/8 bg-wall-deep/60">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:py-32">
          <div>
            <h2 id="close-title" className="text-display max-w-[14ch] text-[clamp(2.6rem,6.5vw,5.25rem)]">
              Your first hold is one click away.
            </h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-chalk/75">
              Tell us what you&apos;re working on, pick a mentor who shares it, and let them set your route.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={signupHref}
                className="inline-flex h-13 items-center gap-2 rounded-[10px] bg-tape-yellow px-7 text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb63]"
              >
                Get started <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <Link href="/browse" className="text-[15px] font-semibold text-chalk underline decoration-chalk/40 decoration-2 underline-offset-4 hover:decoration-chalk">
                Browse every mentor
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden h-[340px] lg:block">
            <span className="tape absolute right-6 top-2 -rotate-3 flex-col items-start gap-0 px-5 py-3 text-3xl" data-tape="yellow">
              Top · First offer
              <span className="text-base">set by your mentor</span>
            </span>
            <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 400 340" preserveAspectRatio="none">
              <polyline points="120,300 230,210 150,130 300,70" fill="none" stroke="rgb(244 245 242 / 0.35)" strokeWidth="2.5" strokeDasharray="10 9" vectorEffect="non-scaling-stroke" />
            </svg>
            <Hold color="yellow" shape={1} size={70} rotate={-14} ticked className="absolute left-[22%] top-[80%]" />
            <Hold color="yellow" shape={3} size={64} rotate={22} ticked className="absolute left-[50%] top-[54%]" />
            <Hold color="yellow" shape={0} size={66} rotate={-8} className="absolute left-[30%] top-[30%]" />
          </div>
        </div>
      </section>
    </div>
  );
}
