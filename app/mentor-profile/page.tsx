"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, Star, Languages, CalendarDays, MessageSquare, CalendarPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import MentorshipRequestForm from "@/components/MentorshipRequestForm";
import SessionSchedulingModal from "@/components/SessionSchedulingModal";
import Person, { firstName } from "@/components/world/Person";
import Footer from "@/components/Footer";
import { Skeleton, EmptyState } from "@/components/app/Ui";
import { skillLabel, skillOverlap } from "@/lib/skills";

type Mentor = {
  id: string;
  name: string;
  title: string;
  company?: string | null;
  school?: string | null;
  location?: string | null;
  bio: string;
  profilePicture?: string | null;
  skills: string[];
  languages: string[];
  rating?: number | null;
  availability: string[];
  experienceLevel?: string;
  category: string;
};

const FIELD: Record<string, string> = {
  TECHNOLOGY: "Tech", BUSINESS: "Business", AVIATION: "Aviation", DESIGN: "Design",
  MARKETING: "Marketing", HEALTH: "Health", CREATIVE: "Creative", MUSIC: "Music",
};
const DAY = (d: string) => d.slice(0, 1) + d.slice(1, 3).toLowerCase();

export default function MentorProfilePage() {
  return (
    <Suspense fallback={<Shell><Skeleton className="h-96" /></Shell>}>
      <Profile />
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="panel min-h-[100dvh]">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function Profile() {
  const id = useSearchParams().get("id");
  const { data: session, status } = useSession();
  const [mentor, setMentor] = useState<Mentor | null | undefined>(undefined);
  const [state, setState] = useState<"signed-out" | "none" | "pending" | "active" | "loading">("loading");
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!id) return setMentor(null);
    fetch(`/api/mentors/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMentor)
      .catch(() => setMentor(null));
  }, [id]);

  const refreshState = useCallback(() => {
    if (!id) return;
    if (status === "unauthenticated") return setState("signed-out");
    if (status !== "authenticated") return;
    fetch(`/api/mentorship-request/status?mentorId=${id}`)
      .then((r) => r.json())
      .then((d) => setState(d.state ?? "none"))
      .catch(() => setState("none"));
    fetch("/api/user/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setMySkills(u?.skills ?? []))
      .catch(() => {});
  }, [id, status]);

  useEffect(refreshState, [refreshState]);

  if (mentor === undefined) {
    return (
      <Shell>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-[420px]" />
          <Skeleton className="h-64" />
        </div>
      </Shell>
    );
  }

  if (!mentor) {
    return (
      <Shell>
        <EmptyState
          title="We couldn't find that mentor."
          body="They may have left MentorMatch, or the link is incomplete."
          action={<Button asChild variant="outline"><Link href="/browse">Browse mentors</Link></Button>}
        />
      </Shell>
    );
  }

  const isSelf = session?.user?.id === mentor.id;
  const isMentorViewer = session?.user?.role === "MENTOR";
  const { shared } = skillOverlap(mySkills, mentor.skills);
  const first = firstName(mentor.name);

  return (
    <Shell>
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All mentors
      </Link>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <article className="route-card overflow-hidden">
          <header className="wall flex flex-wrap items-end gap-6 px-6 pb-7 pt-10 sm:px-8">
            <Person name={mentor.name} src={mentor.profilePicture} size="xl" className="ring-4 ring-chalk/15" />
            <div className="min-w-0 flex-1">
              {FIELD[mentor.category] && (
                <span className="tape mb-3 text-sm" data-tape="chalk">{FIELD[mentor.category]}</span>
              )}
              <h1 className="text-display text-[clamp(2rem,4.5vw,3rem)] text-chalk">{mentor.name}</h1>
              <p className="mt-2 text-lg text-chalk/80">
                {[mentor.title, mentor.company].filter(Boolean).join(" at ")}
              </p>
            </div>
          </header>

          <div className="grid gap-8 px-6 py-7 sm:px-8">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink-soft">
              {mentor.rating ? (
                <li className="inline-flex items-center gap-1.5 font-semibold text-ink">
                  <Star className="size-4 fill-tape-yellow text-yellow-600" aria-hidden="true" /> {mentor.rating.toFixed(1)}
                </li>
              ) : null}
              {mentor.location && (
                <li className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" /> {mentor.location}</li>
              )}
              {mentor.languages?.length > 0 && (
                <li className="inline-flex items-center gap-1.5"><Languages className="size-4" aria-hidden="true" /> {mentor.languages.join(", ")}</li>
              )}
              {mentor.availability?.length > 0 && (
                <li className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" /> {mentor.availability.map(DAY).join(", ")}</li>
              )}
            </ul>

            {mentor.bio && (
              <section aria-labelledby="about">
                <h2 id="about" className="text-lg font-bold">About {first}</h2>
                <p className="mt-2 max-w-[65ch] whitespace-pre-line text-[17px] leading-relaxed text-ink-soft">{mentor.bio}</p>
              </section>
            )}

            <section aria-labelledby="skills">
              <h2 id="skills" className="text-lg font-bold">Skills</h2>
              {shared.length > 0 && (
                <p className="mt-1 text-[15px] text-ink-soft">
                  You share {shared.length} of these with {first}. They&apos;re taped in yellow.
                </p>
              )}
              <ul className="mt-3 flex flex-wrap gap-2">
                {mentor.skills.map((s) => {
                  const hit = shared.includes(s);
                  return (
                    <li key={s} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${hit ? "bg-tape-yellow text-ink" : "bg-gray-100 text-ink-soft"}`}>
                      {skillLabel(s)}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </article>

        <aside className="route-card sticky top-24 p-6">
          {isSelf ? (
            <>
              <p className="font-bold">This is your public profile.</p>
              <p className="mt-1 text-[15px] text-ink-soft">This is what mentees see when they find you.</p>
              <Button asChild variant="outline" className="mt-5 w-full"><Link href="/profile">Edit profile</Link></Button>
            </>
          ) : state === "active" ? (
            <>
              <p className="font-bold">{first} is your mentor.</p>
              <p className="mt-1 text-[15px] text-ink-soft">Message them or book your next session.</p>
              <div className="mt-5 grid gap-2">
                <SessionSchedulingModal mentorId={mentor.id} mentorName={mentor.name}>
                  <Button variant="tape" size="lg" className="w-full"><CalendarPlus aria-hidden="true" /> Book a session</Button>
                </SessionSchedulingModal>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/messages?partnerId=${mentor.id}`}><MessageSquare aria-hidden="true" /> Message {first}</Link>
                </Button>
              </div>
            </>
          ) : state === "pending" ? (
            <>
              <p className="inline-flex items-center gap-2 font-bold"><Clock className="size-4" aria-hidden="true" /> Request sent</p>
              <p className="mt-1 text-[15px] text-ink-soft">
                {first} hasn&apos;t replied yet. You&apos;ll be able to message them as soon as they accept.
              </p>
            </>
          ) : state === "signed-out" ? (
            <>
              <p className="font-bold">Want {first} to set your route?</p>
              <p className="mt-1 text-[15px] text-ink-soft">Create a free account to send a mentorship request.</p>
              <Button asChild variant="tape" size="lg" className="mt-5 w-full">
                <Link href={`/signup?skills=${encodeURIComponent(mentor.skills.join(","))}`}>Get started</Link>
              </Button>
              <p className="mt-3 text-center text-sm text-ink-soft">
                Have an account? <Link href={`/login?callbackUrl=${encodeURIComponent(`/mentor-profile?id=${mentor.id}`)}`} className="font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">Sign in</Link>
              </p>
            </>
          ) : isMentorViewer ? (
            <>
              <p className="font-bold">You&apos;re signed in as a mentor.</p>
              <p className="mt-1 text-[15px] text-ink-soft">Mentorship requests are sent from mentee accounts.</p>
            </>
          ) : (
            <>
              <p className="font-bold">Want {first} to set your route?</p>
              <p className="mt-1 text-[15px] text-ink-soft">
                Tell them what you&apos;re working toward. If they accept, you&apos;ll get a private chat and a roadmap.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="tape" size="lg" className="mt-5 w-full" disabled={state === "loading"}>
                    Request mentorship
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto">
                  <DialogTitle className="text-display text-2xl">Ask {first} to mentor you</DialogTitle>
                  <DialogDescription className="text-ink-soft">
                    A short, specific note gets the best response: what you want help with and why {first}.
                  </DialogDescription>
                  <MentorshipRequestForm
                    mentorId={mentor.id}
                    mentorName={mentor.name}
                    onSuccess={() => {
                      setOpen(false);
                      refreshState();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </aside>
      </div>
    </Shell>
  );
}
