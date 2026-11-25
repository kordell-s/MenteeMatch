"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, ArrowRight, Star, X } from "lucide-react";
import Person from "@/components/world/Person";
import { EmptyState, ErrorNote, Skeleton } from "@/components/app/Ui";
import { skillLabel, skillOverlap } from "@/lib/skills";

type Mentor = {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  rating: number;
  skills: string[];
  category: string;
  availability: string[];
  availabilityStatus: string;
  profilePicture?: string | null;
};

const FIELDS: { id: string; label: string }[] = [
  { id: "ALL", label: "All fields" },
  { id: "TECHNOLOGY", label: "Tech" },
  { id: "BUSINESS", label: "Business" },
  { id: "AVIATION", label: "Aviation" },
  { id: "DESIGN", label: "Design" },
  { id: "MARKETING", label: "Marketing" },
  { id: "HEALTH", label: "Health" },
  { id: "CREATIVE", label: "Creative" },
  { id: "MUSIC", label: "Music" },
];

const DAY = (d: string) => d.slice(0, 1) + d.slice(1, 3).toLowerCase();

export default function MentorBrowser() {
  const { status } = useSession();
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [field, setField] = useState("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mentors")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load mentors."))))
      .then(setMentors)
      .catch((e) => {
        setError(e.message);
        setMentors([]);
      });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => u?.role === "MENTEE" && setMySkills(u.skills ?? []))
      .catch(() => {});
  }, [status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: mentors?.length ?? 0 };
    mentors?.forEach((m) => (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [mentors]);

  const rows = useMemo(() => {
    if (!mentors) return [];
    const q = query.trim().toLowerCase();
    return mentors
      .filter((m) => field === "ALL" || m.category === field)
      .filter(
        (m) =>
          !q ||
          [m.name, m.title, m.company, m.bio, ...m.skills.map(skillLabel)].join(" ").toLowerCase().includes(q)
      )
      .map((m) => ({ m, ...skillOverlap(mySkills, m.skills) }))
      .sort((a, b) => b.score - a.score || (b.m.rating ?? 0) - (a.m.rating ?? 0));
  }, [mentors, field, query, mySkills]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-display text-[clamp(2.2rem,5vw,3.6rem)]">Find your mentor</h1>
          <p className="mt-3 max-w-[56ch] text-[17px] text-ink-soft">
            {mySkills.length
              ? "Ranked by how many of your skills each mentor shares. Shared skills are taped in yellow."
              : "Mentors from tech, business, aviation and more. Search by name, role or skill."}
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <label htmlFor="mentor-search" className="sr-only">Search mentors</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            id="mentor-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pilot training, finance, React"
            className="h-12 w-full rounded-[12px] border border-input bg-card pl-11 pr-10 text-[15px] outline-none placeholder:text-ink-faint focus-visible:border-tape-blue focus-visible:ring-[3px] focus-visible:ring-tape-blue/25"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[8px] p-1.5 text-ink-soft hover:text-ink" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Field" className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {FIELDS.filter((f) => f.id === "ALL" || counts[f.id]).map((f) => {
          const on = field === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setField(f.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                on ? "bg-ink text-chalk" : "bg-card text-ink ring-1 ring-ink/10 hover:ring-ink/30"
              }`}
            >
              {f.label}
              <span className={`tabular text-xs ${on ? "text-chalk/70" : "text-ink-soft"}`}>{counts[f.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="mt-6"><ErrorNote message={error} onRetry={() => location.reload()} /></div>}

      {mentors === null ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No mentors match that."
            body="Try another field or a broader search."
            action={
              <button type="button" onClick={() => { setQuery(""); setField("ALL"); }} className="text-sm font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ m, shared, score }) => (
            <li key={m.id} className="route-card group relative flex flex-col p-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <Person name={m.name} src={m.profilePicture} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold leading-tight tracking-tight">{m.name}</h2>
                  <p className="mt-0.5 text-[15px] text-ink-soft">{[m.title, m.company].filter(Boolean).join(" at ")}</p>
                  {m.rating > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="size-4 fill-tape-yellow text-yellow-600" aria-hidden="true" /> {m.rating.toFixed(1)}
                    </p>
                  )}
                </div>
                {mySkills.length > 0 && shared.length > 0 && (
                  <p className="text-right">
                    <span className="tabular block text-2xl font-extrabold leading-none tracking-tight">{Math.round(score * 100)}%</span>
                    <span className="text-xs text-ink-soft">overlap</span>
                  </p>
                )}
              </div>
              {m.bio && <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-ink-soft">{m.bio}</p>}
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
                {m.skills.map((s) => {
                  const hit = shared.includes(s);
                  return (
                    <li key={s} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${hit ? "bg-tape-yellow text-ink" : "bg-gray-100 text-ink-soft"}`}>
                      {skillLabel(s)}
                      {hit && <span className="sr-only"> (you share this)</span>}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <p className="text-sm text-ink-soft">
                  {m.availability?.length ? m.availability.map(DAY).join(", ") : "Availability not set"}
                </p>
                <Link
                  href={`/mentor-profile?id=${m.id}`}
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 after:absolute after:inset-0 hover:decoration-ink"
                >
                  View profile <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
