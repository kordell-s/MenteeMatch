"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RoadmapWizard from "@/components/roadmap/RoadmapWizard";
import { Button } from "@/components/ui/button";
import Person from "@/components/world/Person";
import { PageTitle, EmptyState, Skeleton } from "@/components/app/Ui";

type Mentorship = { id: string; mentee: { id: string; name: string; profilePicture?: string | null } };

export default function CreateRoadmapPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <Create />
    </Suspense>
  );
}

function Create() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const mentorshipId = params.get("mentorshipId");
  const menteeId = params.get("menteeId");
  const [options, setOptions] = useState<Mentorship[] | null>(null);
  const [chosen, setChosen] = useState<Mentorship | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role !== "MENTOR") {
      router.replace("/dashboard");
      return;
    }
    const q = new URLSearchParams({ status: "ACCEPTED" });
    if (mentorshipId) q.set("id", mentorshipId);
    if (menteeId) q.set("menteeId", menteeId);
    fetch(`/api/mentorships?${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Mentorship[]) => {
        setOptions(rows);
        if ((mentorshipId || menteeId) && rows.length === 1) setChosen(rows[0]);
      })
      .catch(() => setOptions([]));
  }, [status, session, mentorshipId, menteeId, router]);

  return (
    <>
      <Link href="/dashboard/roadmaps" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Routes
      </Link>
      <PageTitle
        title={chosen ? `Set a route for ${chosen.mentee.name.split(" ")[0]}` : "Set a route"}
        lede="Pick a length and focus, then lay out the milestones in order. You can edit everything later."
      />

      {options === null ? (
        <Skeleton className="h-48" />
      ) : options.length === 0 ? (
        <EmptyState
          title="No mentees to set a route for."
          body="Accept a mentorship request first. Then you can build their route here."
          action={<Button asChild variant="outline"><Link href="/dashboard/requests">See requests</Link></Button>}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setChosen(m)}
                className="route-card flex w-full items-center gap-4 p-5 text-left transition-transform hover:-translate-y-0.5"
              >
                <Person name={m.mentee.name} src={m.mentee.profilePicture} size="md" />
                <span>
                  <span className="block font-bold">{m.mentee.name}</span>
                  <span className="text-sm font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">Set their route</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {chosen && (
        <RoadmapWizard
          open
          onClose={() => router.push("/dashboard/roadmaps")}
          mentorshipId={chosen.id}
          menteeName={chosen.mentee.name}
        />
      )}
    </>
  );
}
