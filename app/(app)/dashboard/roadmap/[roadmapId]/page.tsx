"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, ExternalLink, Plus, CalendarClock, MessageSquare, Link2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Hold from "@/components/world/Hold";
import Person from "@/components/world/Person";
import RouteStrip from "@/components/world/RouteStrip";
import { EmptyState, ErrorNote, Skeleton, dueLabel } from "@/components/app/Ui";

type Who = { id: string; name: string; profilePicture?: string | null };
type Task = { id: string; title: string; completed: boolean; status?: string; dueDate?: string | null };
type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  dueDate: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  tasks: Task[];
  checkIns: { id: string; scheduledDate: string; status: string; mentorNotes?: string | null }[];
  resources: { id: string; title: string; url: string; resourceType: string }[];
};
type Roadmap = {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  focusArea: string;
  status: string;
  startDate: string;
  endDate: string;
  mentorship: { id: string; mentor: Who; mentee: Who };
  milestones: Milestone[];
};

const taskDone = (t: Task) => t.completed || t.status === "COMPLETED";

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/roadmaps/${roadmapId}`);
    if (!res.ok) return setRoadmap(null);
    const data = await res.json();
    data.milestones?.sort((a: Milestone, b: Milestone) => a.order - b.order);
    setRoadmap(data);
  }, [roadmapId]);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (url: string, method: string, body: unknown) => {
    setError(null);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "That change didn't save. Try again.");
      return false;
    }
    await load();
    return true;
  };

  if (roadmap === undefined) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-60" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (roadmap === null) {
    return (
      <EmptyState
        title="We couldn't open that route."
        body="It may have been archived, or it belongs to someone else."
        action={<Button asChild variant="outline"><Link href="/dashboard/roadmaps">Back to routes</Link></Button>}
      />
    );
  }

  const isMentor = session?.user?.id === roadmap.mentorship.mentor.id;
  const other = isMentor ? roadmap.mentorship.mentee : roadmap.mentorship.mentor;
  const currentIdx = roadmap.milestones.findIndex((m) => m.status !== "COMPLETED");
  const done = roadmap.milestones.filter((m) => m.status === "COMPLETED").length;

  return (
    <>
      <Link href="/dashboard/roadmaps" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Routes
      </Link>

      <header className="wall rounded-[18px] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[clamp(1.9rem,4vw,2.8rem)]" style={{ color: "var(--color-chalk)" }}>
              {roadmap.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-chalk/70">
              <span className="tape text-sm" data-tape="chalk">
                {isMentor ? `For ${other.name}` : `Set by ${roadmap.mentorship.mentor.name}`}
              </span>
              <span>{roadmap.focusArea} · {roadmap.duration} weeks</span>
            </div>
            {roadmap.description && <p className="mt-2 max-w-[60ch] text-chalk/75">{roadmap.description}</p>}
          </div>
          <Button asChild variant="tape">
            <Link href={`/messages?partnerId=${other.id}`}><MessageSquare aria-hidden="true" /> Message {other.name.split(" ")[0]}</Link>
          </Button>
        </div>
        {roadmap.milestones.length > 0 && (
          <div className="mt-8">
            <RouteStrip milestones={roadmap.milestones} tone="wall" size={40} />
            <p className="tabular mt-4 text-sm text-chalk/70">
              {done} of {roadmap.milestones.length} milestones reached · {format(new Date(roadmap.startDate), "MMM d")} to{" "}
              {format(new Date(roadmap.endDate), "MMM d, yyyy")}
            </p>
          </div>
        )}
      </header>

      {error && <div className="mt-6"><ErrorNote message={error} /></div>}

      {roadmap.milestones.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No milestones on this route yet." body={isMentor ? "Add milestones from the route builder." : "Your mentor is still setting it."} />
        </div>
      ) : (
        <ol className="relative mt-8 grid gap-5">
          <span aria-hidden="true" className="absolute bottom-6 left-[27px] top-6 hidden border-l-2 border-dashed border-ink/15 sm:block" />
          {roadmap.milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              m={m}
              index={i}
              current={i === currentIdx}
              isMentor={isMentor}
              menteeId={roadmap.mentorship.mentee.id}
              call={call}
            />
          ))}
        </ol>
      )}
    </>
  );
}

function MilestoneRow({
  m,
  index,
  current,
  isMentor,
  menteeId,
  call,
}: {
  m: Milestone;
  index: number;
  current: boolean;
  isMentor: boolean;
  menteeId: string;
  call: (url: string, method: string, body: unknown) => Promise<boolean>;
}) {
  const reached = m.status === "COMPLETED";
  const [adding, setAdding] = useState<null | "task" | "resource" | "checkin">(null);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const due = dueLabel(m.dueDate);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let ok = false;
    if (adding === "task" && a.trim()) {
      ok = await call("/api/tasks", "POST", { title: a.trim(), dueDate: b ? new Date(b).toISOString() : null, menteeId, milestoneId: m.id });
    } else if (adding === "resource" && a.trim() && b.trim()) {
      ok = await call(`/api/milestones/${m.id}/resources`, "POST", { title: a.trim(), url: b.trim(), resourceType: "LINK" });
    } else if (adding === "checkin" && a) {
      ok = await call(`/api/milestones/${m.id}/check-ins`, "POST", { scheduledDate: new Date(a).toISOString(), mentorNotes: b || undefined, createSession: true });
    }
    if (ok) {
      setAdding(null);
      setA("");
      setB("");
    }
  };

  return (
    <li id={`milestone-${m.id}`} className="relative grid gap-4 sm:grid-cols-[56px_1fr]">
      <div className="hidden justify-center pt-4 sm:flex">
        <Hold
          color="yellow"
          shape={index}
          size={current ? 56 : 46}
          rotate={(index * 37) % 60 - 30}
          ticked={reached}
          className={reached || current ? "" : "opacity-35 grayscale"}
        />
      </div>

      <section
        aria-labelledby={`m-${m.id}`}
        className={`route-card p-5 sm:p-6 ${current ? "ring-2 ring-tape-blue" : ""} ${!reached && !current ? "bg-card/80" : ""}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={`m-${m.id}`} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xl font-extrabold tracking-tight">
              <span className="tabular rounded-[4px] bg-ink px-1.5 py-0.5 text-xs font-bold text-tape-yellow" aria-label={`Grade ${index === 0 ? "start" : index}`}>
                {index === 0 ? "Start" : `V${index}`}
              </span>
              {m.title}
              {current && <span className="rounded-full bg-tape-blue px-2 py-0.5 text-xs font-semibold text-white">{isMentor ? "Current" : "You're here"}</span>}
              {reached && <span className="rounded-full bg-tape-green-soft px-2 py-0.5 text-xs font-semibold text-green-800">Reached</span>}
            </h2>
            {m.description && <p className="mt-1.5 max-w-[65ch] text-[15px] leading-relaxed text-ink-soft">{m.description}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {due && !reached && (
              <span className={`tabular rounded-full px-2.5 py-1 text-xs font-semibold ${due.tone === "late" ? "bg-tape-red-soft text-red-800" : "bg-gray-100 text-ink-soft"}`}>
                {due.text}
              </span>
            )}
            {!reached ? (
              <Button size="sm" variant={current ? "tape" : "outline"} onClick={() => call(`/api/milestones/${m.id}`, "PATCH", { status: "COMPLETED" })}>
                <Check aria-hidden="true" /> Mark reached
              </Button>
            ) : (
              isMentor && (
                <Button size="sm" variant="ghost" onClick={() => call(`/api/milestones/${m.id}`, "PATCH", { status: "IN_PROGRESS" })}>
                  Reopen
                </Button>
              )
            )}
          </div>
        </div>

        {(m.tasks.length > 0 || m.resources.length > 0 || m.checkIns.length > 0) && (
          <div className="mt-5 grid gap-5 border-t border-ink/8 pt-5 md:grid-cols-2">
            {m.tasks.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-ink-soft">Tasks</h3>
                <ul className="mt-2 grid gap-1">
                  {m.tasks.map((t) => {
                    const d = taskDone(t);
                    return (
                      <li key={t.id} className="flex items-center gap-3 py-1">
                        <button
                          type="button"
                          onClick={() => call(`/api/tasks/${t.id}`, "PATCH", { action: d ? "RESET" : "COMPLETE" })}
                          aria-pressed={d}
                          aria-label={d ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
                          className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                            d ? "border-tape-green bg-tape-green text-ink" : "border-ink/25 text-transparent hover:border-tape-green hover:text-tape-green"
                          }`}
                        >
                          <Check className="size-3.5" strokeWidth={3} />
                        </button>
                        <span className={`text-[15px] ${d ? "text-ink-soft line-through decoration-ink/30" : "font-medium"}`}>{t.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {m.resources.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-ink-soft">Resources</h3>
                <ul className="mt-2 grid gap-1.5">
                  {m.resources.map((r) => (
                    <li key={r.id}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
                        {r.title} <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {m.checkIns.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-ink-soft">Check-ins</h3>
                <ul className="mt-2 grid gap-1.5 text-[15px]">
                  {m.checkIns.map((c) => (
                    <li key={c.id} className="tabular">
                      {format(new Date(c.scheduledDate), "EEE, MMM d · h:mm a")}{" "}
                      <span className="text-sm text-ink-soft">({c.status.toLowerCase()})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {isMentor && (
          <div className="mt-5 border-t border-ink/8 pt-4">
            {adding ? (
              <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div className="grid gap-1.5">
                  <label htmlFor={`a-${m.id}`} className="text-sm font-semibold">
                    {adding === "task" ? "Task" : adding === "resource" ? "Title" : "Date and time"}
                  </label>
                  <Input
                    id={`a-${m.id}`}
                    type={adding === "checkin" ? "datetime-local" : "text"}
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor={`b-${m.id}`} className="text-sm font-semibold">
                    {adding === "task" ? "Due (optional)" : adding === "resource" ? "Link" : "Note (optional)"}
                  </label>
                  <Input
                    id={`b-${m.id}`}
                    type={adding === "task" ? "date" : adding === "resource" ? "url" : "text"}
                    value={b}
                    onChange={(e) => setB(e.target.value)}
                    required={adding === "resource"}
                    placeholder={adding === "resource" ? "https://" : undefined}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add</Button>
                  <Button type="button" variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setAdding("task")}><Plus aria-hidden="true" /> Task</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding("resource")}><Link2 aria-hidden="true" /> Resource</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding("checkin")}><CalendarClock aria-hidden="true" /> Check-in</Button>
              </div>
            )}
          </div>
        )}
      </section>
    </li>
  );
}
