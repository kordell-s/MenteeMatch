"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Check, MessageSquare, CalendarPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Person, { firstName as personFirstName } from "@/components/world/Person";
import RouteStrip from "@/components/world/RouteStrip";
import SessionSchedulingModal from "@/components/SessionSchedulingModal";
import { PageTitle, Panel, EmptyState, Skeleton, ErrorNote, TextLink, formatWhen, dueLabel } from "@/components/app/Ui";


type Who = { id: string; name: string; profilePicture?: string | null };
type SessionRow = { id: string; title: string; date: string; time: string; duration: number; status: string; mentor?: Who; mentee?: Who };
type Milestone = { id: string; title: string; status: string; dueDate: string };
type Roadmap = {
  id: string;
  title: string;
  status: string;
  duration: number;
  milestones: Milestone[];
  mentorship: { mentor: Who; mentee: Who };
  progress: { milestones: { total: number; completed: number }; tasks: { total: number; completed: number } };
};
type MenteeData = {
  mentorInfo: (Who & { title?: string; company?: string; rating?: number | null; skills?: string[] }) | null;
  tasks: { id: string; title: string; status: string; dueDate: string | null; milestone: { title: string; roadmapId: string } | null }[];
  upcomingSessions: SessionRow[];
  completedSessions: SessionRow[];
};
type MentorData = {
  confirmedMentees: (Who & { goals: string[]; title?: string })[];
  recentRequests: { id: string; status: string; message: string; createdAt: string; mentee: Who & { goals: string[] } }[];
  upcomingSessions: SessionRow[];
  completedSessions: number;
};

const firstName = (n?: string | null) => personFirstName(n) || "there";
const goal = (g: string) => g.toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function Dashboard() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const [mentee, setMentee] = useState<MenteeData | null>(null);
  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!role) return;
    setError(null);
    try {
      const [dash, maps] = await Promise.all([
        fetch(role === "MENTOR" ? "/api/dashboard/mentor" : "/api/dashboard/mentee"),
        fetch("/api/roadmaps?status=ACTIVE"),
      ]);
      if (!dash.ok) throw new Error((await dash.json().catch(() => ({}))).error || "Could not load your dashboard.");
      const data = await dash.json();
      if (role === "MENTOR") setMentor(data);
      else setMentee(data);
      setRoadmaps(maps.ok ? await maps.json() : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  if (status === "loading" || (loading && !error)) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-56" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title={`Hi, ${firstName(session?.user?.name)}`}
        lede={role === "MENTOR" ? "Here's who needs you this week." : "Here's where you are on your route."}
      />
      {error && <div className="mb-6"><ErrorNote message={error} onRetry={load} /></div>}
      {role === "MENTOR" && mentor && <MentorView data={mentor} roadmaps={roadmaps} onChange={load} />}
      {role !== "MENTOR" && mentee && <MenteeView data={mentee} roadmap={roadmaps[0]} onChange={load} />}
    </>
  );
}

/* ---------------------------------- Mentee --------------------------------- */

function MenteeView({ data, roadmap, onChange }: { data: MenteeData; roadmap?: Roadmap; onChange: () => void }) {
  const m = data.mentorInfo;
  const current = roadmap?.milestones.find((x) => x.status !== "COMPLETED");
  const [busy, setBusy] = useState<string | null>(null);

  const complete = async (id: string) => {
    setBusy(id);
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "COMPLETE" }),
    });
    setBusy(null);
    onChange();
  };

  return (
    <div className="grid gap-6">
      {/* The route: the one thing a mentee needs to see first. */}
      {roadmap ? (
        <section aria-labelledby="route-h" className="wall overflow-hidden rounded-[18px] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="route-h" className="text-display text-[clamp(1.6rem,3vw,2.25rem)]">
                {roadmap.title}
              </h2>
              <span className="tape mt-3 text-sm" data-tape="chalk">Set by {roadmap.mentorship.mentor.name}</span>
            </div>
            <Link
              href={`/dashboard/roadmap/${roadmap.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-tape-yellow px-4 text-sm font-bold text-ink hover:bg-[#ffdb63]"
            >
              Open route <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8">
            <RouteStrip milestones={roadmap.milestones} tone="wall" size={44} />
          </div>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="text-lg">
              {current ? (
                <>
                  <span className="text-chalk/70">Next hold: </span>
                  <span className="mr-2 rounded-[4px] bg-chalk px-1.5 py-0.5 text-sm font-bold text-ink">
                    {roadmap.milestones.indexOf(current) === 0 ? "Start" : `V${roadmap.milestones.indexOf(current)}`}
                  </span>
                  <span className="font-bold">{current.title}</span>
                </>
              ) : (
                <span className="font-bold">Route complete. Every hold reached.</span>
              )}
            </p>
            <p className="tabular text-sm text-chalk/70">
              {roadmap.progress.milestones.completed} of {roadmap.progress.milestones.total} milestones ·{" "}
              {roadmap.progress.tasks.completed} of {roadmap.progress.tasks.total} tasks
            </p>
          </div>
        </section>
      ) : (
        <section className="wall rounded-[18px] p-6 sm:p-8">
          <h2 className="text-display text-[clamp(1.6rem,3vw,2.25rem)]">
            {m ? "Your route isn't set yet." : "First, find your mentor."}
          </h2>
          <p className="mt-3 max-w-[52ch] text-chalk/75">
            {m
              ? `${m.name} will build your roadmap. Say hi and tell them what you're aiming for.`
              : "Pick a mentor who shares your skills and send a request. Once they accept, they'll set your route."}
          </p>
          <div className="mt-6">
            {m ? (
              <Link href={`/messages?partnerId=${m.id}`} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-tape-yellow px-5 font-bold text-ink">
                <MessageSquare className="size-4" aria-hidden="true" /> Message {firstName(m.name)}
              </Link>
            ) : (
              <Link href="/browse" className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-tape-yellow px-5 font-bold text-ink">
                Find mentors <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Next up" action={roadmap && <TextLink href={`/dashboard/roadmap/${roadmap.id}`}>All tasks</TextLink>}>
          {data.tasks.length === 0 ? (
            <EmptyState
              title="Nothing on your list."
              body={m ? "When your mentor assigns tasks they'll show up here." : "Tasks arrive once a mentor sets your route."}
            />
          ) : (
            <ul className="-mx-2 grid min-w-0">
              {data.tasks.map((t) => {
                const due = dueLabel(t.dueDate);
                return (
                  <li key={t.id} className="flex min-w-0 items-center gap-3 rounded-[10px] px-2 py-3 hover:bg-ink/[0.03]">
                    <button
                      type="button"
                      onClick={() => complete(t.id)}
                      disabled={busy === t.id}
                      aria-label={`Mark "${t.title}" done`}
                      className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink/25 text-transparent transition-colors hover:border-tape-green hover:bg-tape-green-soft hover:text-tape-green disabled:opacity-50"
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{t.title}</p>
                      {t.milestone && <p className="truncate text-sm text-ink-soft">{t.milestone.title}</p>}
                    </div>
                    {due && (
                      <span
                        className={`tabular shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          due.tone === "late" ? "bg-tape-red-soft text-red-800" : due.tone === "soon" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-ink-soft"
                        }`}
                      >
                        {due.text}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="grid min-w-0 content-start gap-6">
          {m && (
            <Panel title="Your mentor">
              <div className="flex items-center gap-4">
                <Person name={m.name} src={m.profilePicture} size="lg" />
                <div className="min-w-0">
                  <p className="text-lg font-bold">{m.name}</p>
                  <p className="text-sm text-ink-soft">{[m.title, m.company].filter(Boolean).join(" at ")}</p>
                  {typeof m.rating === "number" && m.rating > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="size-4 fill-tape-yellow text-yellow-600" aria-hidden="true" />
                      {m.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link href={`/messages?partnerId=${m.id}`}>
                    <MessageSquare aria-hidden="true" /> Message
                  </Link>
                </Button>
                <SessionSchedulingModal mentorId={m.id} mentorName={m.name} onSuccess={onChange}>
                  <Button className="w-full">
                    <CalendarPlus aria-hidden="true" /> Book session
                  </Button>
                </SessionSchedulingModal>
              </div>
            </Panel>
          )}

          <Panel title="Sessions" action={<TextLink href="/dashboard/sessions">All sessions</TextLink>}>
            <SessionList rows={data.upcomingSessions} other="mentor" empty="No sessions booked." />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Mentor --------------------------------- */

function MentorView({ data, roadmaps, onChange }: { data: MentorData; roadmaps: Roadmap[]; onChange: () => void }) {
  const pending = data.recentRequests.filter((r) => r.status === "PENDING");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const routeFor = (menteeId: string) => roadmaps.find((r) => r.mentorship.mentee.id === menteeId);

  const respond = async (id: string, action: "accept" | "reject") => {
    setBusy(id);
    setErr(null);
    const res = await fetch(`/api/mentorship-request/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (!res.ok) {
      setErr((await res.json().catch(() => ({}))).error || "That didn't go through. Try again.");
      return;
    }
    onChange();
  };

  return (
    <div className="grid gap-6">
      <p className="tabular -mt-4 text-[15px] text-ink-soft">
        {data.confirmedMentees.length} mentees · {roadmaps.length} active routes · {data.completedSessions} {data.completedSessions === 1 ? "session" : "sessions"} completed
      </p>

      {pending.length > 0 && (
        <section aria-labelledby="req-h" className="wall rounded-[18px] p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="req-h" className="text-display text-[clamp(1.5rem,2.6vw,2rem)]">
              {pending.length === 1 ? "1 person wants your help" : `${pending.length} people want your help`}
            </h2>
            <Link href="/dashboard/requests" className="text-sm font-semibold text-chalk/80 hover:text-chalk hover:underline">
              All requests
            </Link>
          </div>
          {err && <p role="alert" className="mt-4 rounded-[10px] bg-tape-red px-3 py-2 text-sm text-white">{err}</p>}
          <ul className="mt-6 grid gap-3 lg:grid-cols-2">
            {pending.slice(0, 4).map((r) => (
              <li key={r.id} className="route-card p-5 text-ink">
                <div className="flex items-center gap-3">
                  <Person name={r.mentee.name} src={r.mentee.profilePicture} size="md" />
                  <div className="min-w-0">
                    <p className="font-bold">{r.mentee.name}</p>
                    {r.mentee.goals.length > 0 && (
                      <p className="truncate text-sm text-ink-soft">{r.mentee.goals.map(goal).join(", ")}</p>
                    )}
                  </div>
                </div>
                {r.message && <p className="mt-3 line-clamp-3 text-[15px] text-ink-soft">&ldquo;{r.message}&rdquo;</p>}
                <div className="mt-4 flex gap-2">
                  <Button variant="tape" size="sm" disabled={busy === r.id} onClick={() => respond(r.id, "accept")}>
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" disabled={busy === r.id} onClick={() => respond(r.id, "reject")}>
                    Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Your mentees" action={<TextLink href="/dashboard/my-mentees">Manage</TextLink>}>
          {data.confirmedMentees.length === 0 ? (
            <EmptyState title="No mentees yet." body="Accepted requests show up here with their route progress." />
          ) : (
            <ul className="-mx-2 grid">
              {data.confirmedMentees.map((me) => {
                const r = routeFor(me.id);
                return (
                  <li key={me.id} className="grid items-center gap-x-4 gap-y-3 rounded-[12px] px-2 py-4 sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
                    <Link href={`/dashboard/mentee/${me.id}`} className="flex min-w-0 items-center gap-3 hover:underline">
                      <Person name={me.name} src={me.profilePicture} size="md" />
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{me.name}</span>
                        <span className="block truncate text-sm text-ink-soft">
                          {me.goals.length ? me.goals.map(goal).join(", ") : me.title ?? "Mentee"}
                        </span>
                      </span>
                    </Link>
                    {r ? (
                      <Link href={`/dashboard/roadmap/${r.id}`} className="block min-w-0" aria-label={`${me.name}'s route: ${r.title}`}>
                        <RouteStrip milestones={r.milestones} size={28} />
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/roadmap/create?menteeId=${me.id}`}
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink"
                      >
                        Set a route <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/messages?partnerId=${me.id}`} aria-label={`Message ${me.name}`}>
                        <MessageSquare aria-hidden="true" />
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming sessions" action={<TextLink href="/dashboard/sessions">All sessions</TextLink>}>
          <SessionList rows={data.upcomingSessions} other="mentee" empty="Nothing booked this week." />
        </Panel>
      </div>
    </div>
  );
}

function SessionList({ rows, other, empty }: { rows: SessionRow[]; other: "mentor" | "mentee"; empty: string }) {
  if (rows.length === 0) return <EmptyState title={empty} />;
  return (
    <ul className="grid gap-3">
      {rows.map((s) => {
        const who = s[other];
        return (
          <li key={s.id} className="flex items-center gap-3">
            <Person name={who?.name} src={who?.profilePicture} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{s.title || "Mentoring session"}</p>
              <p className="tabular text-sm text-ink-soft">
                {formatWhen(s.date, s.time)} · {s.duration} min
              </p>
            </div>
            {s.status === "PENDING" && (
              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Pending</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

