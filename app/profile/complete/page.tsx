"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Wordmark from "@/components/world/Wordmark";
import Person from "@/components/world/Person";
import { SKILL_GROUPS, GOAL_LABELS, LEVEL_LABELS, FIELD_LABELS, skillLabel } from "@/lib/skills";

const SPECIALIZATION_GROUPS: { label: string; items: string[] }[] = [
  { label: "Career", items: ["CAREER_COACHING", "RESUME_OPTIMIZATION", "TECHNICAL_INTERVIEWING", "LEADERSHIP_DEVELOPMENT", "PUBLIC_SPEAKING", "NETWORKING_STRATEGY", "FREELANCING_GUIDANCE"] },
  { label: "Aviation", items: ["FLIGHT_TRAINING_GUIDANCE", "AIRLINE_INTERVIEW_PREP", "AVIATION_MAINTENANCE_CAREERS", "AVIATION_OPERATIONS_CAREERS"] },
  { label: "Business", items: ["BUSINESS_ANALYSIS", "PROJECT_MANAGEMENT", "PRODUCT_MANAGEMENT", "STRATEGIC_PLANNING", "STARTUP_CONSULTING", "BUSINESS_INTELLIGENCE"] },
  { label: "Marketing", items: ["DIGITAL_MARKETING", "CONTENT_MARKETING", "GROWTH_MARKETING", "SOCIAL_MEDIA_STRATEGY", "BRAND_MANAGEMENT", "SEO_OPTIMIZATION"] },
  { label: "Design", items: ["UI_UX_DESIGN", "PRODUCT_DESIGN", "GRAPHIC_DESIGN", "USER_RESEARCH", "DESIGN_SYSTEMS", "ACCESSIBILITY_DESIGN"] },
  { label: "Tech", items: ["FRONTEND_DEVELOPMENT", "BACKEND_DEVELOPMENT", "FULLSTACK_DEVELOPMENT", "MOBILE_DEVELOPMENT", "DATA_ANALYSIS", "DATA_ENGINEERING", "MACHINE_LEARNING_ENGINEERING", "CLOUD_COMPUTING", "DEVOPS_ENGINEERING", "CYBERSECURITY", "QUALITY_ASSURANCE"] },
];
const SPEC_LABEL: Record<string, string> = {
  TECHNICAL_INTERVIEWING: "Interview coaching",
  RESUME_OPTIMIZATION: "Résumé reviews",
  UI_UX_DESIGN: "UI/UX design",
  SEO_OPTIMIZATION: "SEO",
  QUALITY_ASSURANCE: "QA and testing",
};
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const TIMES: { v: string; l: string }[] = [
  { v: "EARLY_MORNING", l: "Early morning" },
  { v: "MORNING", l: "Morning" },
  { v: "AFTERNOON", l: "Afternoon" },
  { v: "EVENING", l: "Evening" },
  { v: "LATE_EVENING", l: "Late evening" },
];
const MENTEE_GOALS = ["LAND_FIRST_ROLE", "GET_CERTIFIED", "TRANSITION_CAREER", "INTERVIEW_PREP", "RESUME_REVIEW", "BUILD_PROJECTS", "CAREER_GUIDANCE", "NETWORKING", "PUBLIC_SPEAKING", "GET_INTO_TECH", "LEARN_CODING"];
const FIELDS = ["TECHNOLOGY", "BUSINESS", "AVIATION", "DESIGN", "MARKETING", "HEALTH", "CREATIVE", "MUSIC", "OTHER"];

function Chips({
  options,
  value,
  onChange,
  label = (v: string) => v,
  single = false,
  max,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label?: (v: string) => string;
  single?: boolean;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() =>
              onChange(single ? [o] : on ? value.filter((x) => x !== o) : max && value.length >= max ? value : [...value, o])
            }
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
              on ? "border-ink bg-ink text-chalk" : "border-ink/15 bg-card text-ink hover:border-ink/40"
            }`}
          >
            {on && <Check className="size-3.5" aria-hidden="true" />}
            {label(o)}
          </button>
        );
      })}
    </div>
  );
}

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="route-card grid gap-5 p-6 sm:p-8" aria-labelledby={`s${n}`}>
      <div>
        <h2 id={`s${n}`} className="text-xl font-extrabold tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-[15px] text-ink-soft">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfile />
    </Suspense>
  );
}

function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const isMentor = session?.user?.role === "MENTOR";

  const [skills, setSkills] = useState<string[]>(() => (params.get("skills") ?? "").split(",").filter(Boolean));
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [school, setSchool] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState<string[]>(["STUDENT"]);
  const [languages, setLanguages] = useState("English");
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [detailedGoals, setDetailedGoals] = useState("");
  const [specs, setSpecs] = useState<string[]>([]);
  const [field, setField] = useState<string[]>(["OTHER"]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);
  useEffect(() => {
    if (isMentor) setLevel(["SENIOR"]);
  }, [isMentor]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (skills.length === 0) return setError("Pick at least one skill.");
    if (!bio.trim()) return setError("Add a short bio.");
    if (!isMentor && goals.length === 0) return setError("Pick at least one goal.");
    if (isMentor && specs.length === 0) return setError("Pick at least one area you can help with.");

    setSaving(true);
    try {
      let profilePicture: string | undefined;
      if (photo) {
        const fd = new FormData();
        fd.append("file", photo);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (up.ok) profilePicture = (await up.json()).url;
      }
      const res = await fetch("/api/profile/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim(),
          skills,
          experienceLevel: level[0],
          title: title || null,
          company: company || null,
          school: school || null,
          location: location || null,
          languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
          availability: days,
          timeAvailability: times,
          goals,
          detailedGoals: detailedGoals || null,
          specialization: specs,
          category: field[0],
          profilePicture,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Your profile didn't save. Try again.");
      window.location.href = isMentor ? "/dashboard" : "/browse";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your profile didn't save. Try again.");
      setSaving(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div className="panel min-h-[100dvh]">
      <header className="wall">
        <div className="mx-auto flex h-16 max-w-[880px] items-center px-4 sm:px-8">
          <Wordmark tone="chalk" />
        </div>
      </header>
      <main className="mx-auto max-w-[880px] px-4 py-10 sm:px-8">
        <h1 className="text-display text-[clamp(2.2rem,5vw,3.2rem)]">
          {isMentor ? "Set up your mentor profile" : "Tell us where you're headed"}
        </h1>
        <p className="mt-3 max-w-[56ch] text-[17px] text-ink-soft">
          {isMentor
            ? "Mentees are matched to you on the skills you list, so be specific."
            : "We match you with mentors on the skills you pick here. You can change any of this later."}
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-6" noValidate>
          {isMentor && (
            <Section n={0} title="Your field">
              <Chips options={FIELDS} value={field} onChange={setField} label={(v) => FIELD_LABELS[v]} single />
            </Section>
          )}

          <Section
            n={1}
            title={isMentor ? "Skills you can teach" : "Skills you're working on"}
            hint={`${skills.length} picked. Choose from any field.`}
          >
            <div className="grid gap-5">
              {SKILL_GROUPS.map((g) => (
                <div key={g.label}>
                  <h3 className="mb-2 text-sm font-bold text-ink-soft">{g.label}</h3>
                  <Chips options={g.skills} value={skills} onChange={setSkills} label={skillLabel} />
                </div>
              ))}
            </div>
          </Section>

          {isMentor ? (
            <Section n={2} title="What you can help with" hint="Pick the kinds of guidance you'll offer.">
              <div className="grid gap-5">
                {SPECIALIZATION_GROUPS.map((g) => (
                  <div key={g.label}>
                    <h3 className="mb-2 text-sm font-bold text-ink-soft">{g.label}</h3>
                    <Chips options={g.items} value={specs} onChange={setSpecs} label={(v) => SPEC_LABEL[v] ?? skillLabel(v)} />
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <Section n={2} title="What do you want from a mentor?">
              <Chips options={MENTEE_GOALS} value={goals} onChange={setGoals} label={(v) => GOAL_LABELS[v]} />
              <div className="grid gap-2">
                <label htmlFor="detailed" className="text-sm font-semibold">In your own words (optional)</label>
                <Textarea
                  id="detailed"
                  rows={3}
                  value={detailedGoals}
                  onChange={(e) => setDetailedGoals(e.target.value)}
                  placeholder="Where you are now, where you want to be, and by when."
                />
              </div>
            </Section>
          )}

          <Section n={3} title="About you">
            <div className="flex items-center gap-4">
              <Person name={session?.user?.name} src={preview} size="lg" />
              <div className="flex gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border border-ink/15 bg-card px-4 text-sm font-semibold hover:border-ink/30">
                  <Upload className="size-4" aria-hidden="true" /> {photo ? "Change photo" : "Add a photo"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                </label>
                {photo && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPhoto(null)} aria-label="Remove photo">
                    <X />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="bio" className="text-sm font-semibold">Short bio</label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={isMentor ? "Your path, what you do now, and who you like helping." : "What you're studying or doing now, and what you're aiming for."}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-semibold">{isMentor ? "Job title" : "Current role (optional)"}</label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isMentor ? "e.g. First Officer" : "e.g. Final-year student"} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="company" className="text-sm font-semibold">{isMentor ? "Company" : "School (optional)"}</label>
                {isMentor ? (
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                ) : (
                  <Input id="company" value={school} onChange={(e) => setSchool(e.target.value)} />
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="location" className="text-sm font-semibold">Location (optional)</label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="languages" className="text-sm font-semibold">Languages</label>
                <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} aria-describedby="languages-hint" />
                <p id="languages-hint" className="text-sm text-ink-soft">Separate with commas.</p>
              </div>
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-semibold">Experience</p>
              <Chips options={Object.keys(LEVEL_LABELS)} value={level} onChange={setLevel} label={(v) => LEVEL_LABELS[v]} single />
            </div>
          </Section>

          <Section n={4} title="When are you free?" hint="Used to suggest session times. Optional.">
            <Chips options={DAYS} value={days} onChange={setDays} label={(d) => d.charAt(0) + d.slice(1).toLowerCase()} />
            <Chips options={TIMES.map((t) => t.v)} value={times} onChange={setTimes} label={(v) => TIMES.find((t) => t.v === v)!.l} />
          </Section>

          {error && (
            <p role="alert" className="rounded-[10px] bg-tape-red-soft px-4 py-3 text-[15px] text-red-800">{error}</p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="tape" size="lg" disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {saving ? "Saving" : isMentor ? "Save and go to dashboard" : "Save and find mentors"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
