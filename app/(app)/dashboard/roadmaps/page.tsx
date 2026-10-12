"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Person from "@/components/world/Person";
import RouteStrip from "@/components/world/RouteStrip";
import { PageTitle, EmptyState, ErrorNote, Skeleton } from "@/components/app/Ui";

type Who = { id: string; name: string; profilePicture?: string | null };
type Roadmap = {
  id: string;
  title: string;
  description?: string | null;
  focusArea: string;
  duration: number;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "ARCHIVED";
  endDate: string;
  milestones: { id: string; title: string; status: string }[];
  mentorship: { mentor: Who; mentee: Who };
  progress: { milestones: { total: number; completed: number }; tasks: { total: number; completed: number } };
};

const FILTERS = [
  { id: "ACTIVE", label: "On the wall" },
  { id: "COMPLETED", label: "Topped out" },
  { id: "PAUSED", label: "Paused" },
  { id: "ARCHIVED", label: "Archived" },
] as const;

export default function RoadmapsPage() {
  const { data: session } = useSession();
  const isMentor = session?.user?.role === "MENTOR";
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("ACTIVE");
  const [rows, setRows] = useState<Roadmap[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/roadmaps?status=${filter}`);
    if (!res.ok) {
      setError("Could not load routes.");
      setRows([]);
      return;
    }
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  }, [filter]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const setStatus = async (id: string, status: Roadmap["status"]) => {
    const res = await fetch(`/api/roadmaps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setError("That change didn't save. Try again.");
    load();
  };

  return (
    <>
      <PageTitle
        title={isMentor ? "Routes" : "My route"}
        lede={isMentor ? "Every route you've set, and how far each mentee has climbed." : "The plan your mentor set for you, hold by hold."}
        actions={
          isMentor && (
            <Button asChild variant="tape">
              <Link href="/dashboard/roadmap/create"><Plus aria-hidden="true" /> Set a route</Link>
            </Button>
          )
        }
      />

      <div role="tablist" aria-label="Route status" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`h-10 rounded-full px-4 text-[15px] font-semibold ${
              filter === f.id ? "bg-ink text-chalk" : "bg-card text-ink ring-1 ring-ink/10 hover:ring-ink/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-6"><ErrorNote message={error} onRetry={load} /></div>}

      {rows === null ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={filter === "ACTIVE" ? (isMentor ? "No routes set yet." : "Your mentor hasn't set your route yet.") : "Nothing here."}
          body={
            filter === "ACTIVE"
              ? isMentor
                ? "Pick a mentee and lay out their milestones in order."
                : "Once they do, every milestone shows up here in order."
              : undefined
          }
          action={
            filter === "ACTIVE" &&
            (isMentor ? (
              <Button asChild variant="tape"><Link href="/dashboard/roadmap/create">Set a route</Link></Button>
            ) : (
              <Button asChild variant="outline"><Link href="/browse">Find a mentor</Link></Button>
            ))
          }
        />
      ) : (
        <ul className="grid gap-5 lg:grid-cols-2">
          {rows.map((r) => {
            const other = isMentor ? r.mentorship.mentee : r.mentorship.mentor;
            const next = r.milestones.find((m) => m.status !== "COMPLETED");
            return (
              <li key={r.id} className="route-card flex flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <Person name={other.name} src={other.profilePicture} size="xs" />
                      {isMentor ? `For ${other.name}` : `Set by ${other.name}`}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold tracking-tight">{r.title}</h2>
                    <p className="mt-0.5 text-[15px] text-ink-soft">{r.focusArea} · {r.duration} weeks</p>
                  </div>
                </div>

                <div className="mt-6">
                  {r.milestones.length ? (
                    <RouteStrip milestones={r.milestones} size={32} />
                  ) : (
                    <p className="text-[15px] text-ink-soft">No milestones yet.</p>
                  )}
                </div>

                <p className="mt-4 text-[15px]">
                  {r.status === "COMPLETED" ? (
                    <span className="font-semibold">Topped out.</span>
                  ) : next ? (
                    <>
                      <span className="text-ink-soft">Next hold: </span>
                      <span className="font-semibold">{next.title}</span>
                    </>
                  ) : (
                    <span className="font-semibold">Every milestone reached.</span>
                  )}
                </p>
                <p className="tabular mt-1 text-sm text-ink-soft">
                  {r.progress.milestones.completed} of {r.progress.milestones.total} milestones · {r.progress.tasks.completed} of {r.progress.tasks.total} tasks
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-4">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/roadmap/${r.id}`}>Open route <ArrowRight aria-hidden="true" /></Link>
                  </Button>
                  {isMentor && r.status === "ACTIVE" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "COMPLETED")}>Mark topped out</Button>
                      <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "PAUSED")}>Pause</Button>
                    </>
                  )}
                  {isMentor && r.status === "PAUSED" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "ACTIVE")}>Resume</Button>
                  )}
                  {isMentor && r.status !== "ARCHIVED" && (
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setStatus(r.id, "ARCHIVED")}>Archive</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
