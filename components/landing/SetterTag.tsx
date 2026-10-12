import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Person, { firstName } from "@/components/world/Person";
import { skillLabel, FIELD_LABELS } from "@/lib/skills";
import type { PublicMentor } from "./Landing";

/**
 * A mentor shown the way a gym shows a route: a laminated route tag hung on a bolt.
 * The tape band names the setter and grades the match; their skills are the holds.
 */
export default function SetterTag({
  m,
  shared,
  score,
  picked,
  tilt = 0,
}: {
  m: PublicMentor;
  shared: string[];
  score: number;
  picked: boolean;
  tilt?: number;
}) {
  const ordered = [...m.skills].sort((a, b) => Number(shared.includes(b)) - Number(shared.includes(a)));
  return (
    <article
      className="group relative flex h-full flex-col rounded-[14px] bg-card pt-7 text-ink shadow-[0_2px_0_rgb(0_0_0/0.25),0_24px_40px_-20px_rgb(0_0_0/0.7)] rotate-[var(--tilt)] transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:-translate-y-1 motion-reduce:transition-none"
      style={{ ["--tilt" as string]: `${tilt}deg` }}
    >
      {/* The bolt the tag hangs from */}
      <span aria-hidden="true" className="absolute left-1/2 top-2.5 grid size-4 -translate-x-1/2 place-items-center rounded-full bg-wall-deep ring-4 ring-gray-200">
        <span className="size-1.5 rounded-full bg-gray-500" />
      </span>

      <div className="tape mx-4 flex justify-between text-[15px]" data-tape="yellow">
        <span>Set by {firstName(m.name)}</span>
        {picked && shared.length > 0 ? (
          <span className="tabular rounded-[4px] bg-ink px-1.5 py-0.5 font-sans text-xs font-bold text-tape-yellow">
            {Math.round(score * 100)}% match
          </span>
        ) : (
          <span className="font-sans text-xs font-bold uppercase tracking-wide">{FIELD_LABELS[m.category] ?? "Mentor"}</span>
        )}
      </div>

      <div className="flex items-start gap-4 px-6 pt-5">
        <Person name={m.name} src={m.profilePicture} size="lg" />
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold leading-tight tracking-tight">{m.name}</h3>
          <p className="mt-0.5 text-[15px] text-ink-soft">{[m.title, m.company].filter(Boolean).join(" at ")}</p>
        </div>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-bold text-ink-soft">
          {picked && shared.length > 0 ? `${shared.length} shared ${shared.length === 1 ? "hold" : "holds"}` : "Holds"}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
          {ordered.map((s) => {
            const hit = shared.includes(s);
            return (
              <li key={s} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${hit ? "bg-tape-yellow text-ink" : "bg-gray-100 text-ink-soft"}`}>
                {skillLabel(s)}
                {hit && <span className="sr-only"> (you share this)</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tear line */}
      <div aria-hidden="true" className="mx-4 mt-auto border-t-2 border-dashed border-ink/12 pt-5" />
      <Link
        href={`/mentor-profile?id=${m.id}`}
        className="-mt-1 inline-flex items-center gap-1.5 px-6 pb-5 text-[15px] font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 after:absolute after:inset-0 hover:decoration-ink"
      >
        View {firstName(m.name)}&apos;s profile <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
