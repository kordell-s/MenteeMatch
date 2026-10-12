"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Person from "@/components/world/Person";
import { PageTitle, EmptyState, ErrorNote, Skeleton } from "@/components/app/Ui";
import { skillLabel } from "@/lib/skills";

type Request = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string;
  offeringType?: string | null;
  createdAt: string;
  mentee: { id: string; name: string; profilePicture?: string | null; skills: string[]; experienceLevel?: string };
};

const TABS = [
  { id: "PENDING", label: "Waiting on you" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "REJECTED", label: "Declined" },
] as const;

const offering = (o?: string | null) => (o ? o.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()) : null);
const level = (l?: string) => (l ? l.charAt(0) + l.slice(1).toLowerCase() : null);

export default function RequestsPage() {
  const [rows, setRows] = useState<Request[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("PENDING");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/mentorship-request");
    if (!res.ok) {
      setError(res.status === 401 ? "Only mentors receive requests." : "Could not load your requests.");
      setRows([]);
      return;
    }
    setRows(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { PENDING: 0, ACCEPTED: 0, REJECTED: 0 } as Record<string, number>;
    rows?.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const respond = async (id: string, action: "accept" | "reject") => {
    setBusy(id);
    setError(null);
    const res = await fetch(`/api/mentorship-request/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "That didn't go through. Try again.");
      return;
    }
    load();
  };

  const shown = rows?.filter((r) => r.status === tab) ?? [];

  return (
    <>
      <PageTitle title="Requests" lede="People asking you to mentor them. Accepting opens a private chat and lets you set their route." />

      <div role="tablist" aria-label="Request status" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[15px] font-semibold ${
              tab === t.id ? "bg-ink text-chalk" : "bg-card text-ink ring-1 ring-ink/10 hover:ring-ink/30"
            }`}
          >
            {t.label}
            <span className={`tabular text-xs ${tab === t.id ? "text-chalk/70" : "text-ink-soft"}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {error && <div className="mb-6"><ErrorNote message={error} onRetry={load} /></div>}

      {rows === null ? (
        <div className="grid gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          title={tab === "PENDING" ? "No one's waiting on you." : tab === "ACCEPTED" ? "No accepted requests yet." : "Nothing declined."}
          body={tab === "PENDING" ? "New requests land here. Mentees find you through Browse and your skills." : undefined}
        />
      ) : (
        <ul className="grid gap-4">
          {shown.map((r) => (
            <li key={r.id} className="route-card grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-start">
              <div className="flex gap-4">
                <Person name={r.mentee.name} src={r.mentee.profilePicture} size="lg" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-lg font-bold">{r.mentee.name}</h2>
                    <span className="text-sm text-ink-soft">{formatDistanceToNowStrict(new Date(r.createdAt))} ago</span>
                  </div>
                  <p className="text-[15px] text-ink-soft">
                    {[level(r.mentee.experienceLevel), offering(r.offeringType)].filter(Boolean).join(" · ")}
                  </p>
                  {r.message && <p className="mt-3 max-w-[65ch] whitespace-pre-line text-[15px] leading-relaxed">{r.message}</p>}
                  {r.mentee.skills?.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
                      {r.mentee.skills.map((s) => (
                        <li key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-[13px] font-semibold text-ink-soft">{skillLabel(s)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:flex-col">
                {r.status === "PENDING" ? (
                  <>
                    <Button variant="tape" disabled={busy === r.id} onClick={() => respond(r.id, "accept")}>Accept</Button>
                    <Button variant="ghost" disabled={busy === r.id} onClick={() => respond(r.id, "reject")}>Decline</Button>
                  </>
                ) : r.status === "ACCEPTED" ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/messages?partnerId=${r.mentee.id}`}><MessageSquare aria-hidden="true" /> Message</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/dashboard/roadmap/create?menteeId=${r.mentee.id}`}>Set a route</Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
