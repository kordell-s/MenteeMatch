"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}

function Onboarding() {
  const { data: session } = useSession();
  const skills = useSearchParams().get("skills");
  const isMentor = session?.user?.role === "MENTOR";
  const first = session?.user?.name?.split(" ")[0];
  const next = skills ? `/profile/complete?skills=${encodeURIComponent(skills)}` : "/profile/complete";

  return (
    <AuthShell
      title={first ? `Welcome, ${first}` : "Welcome"}
      lede="Your account is ready. One more step."
      wallLine={isMentor ? "Time to set some routes." : "Your route starts here."}
    >
      <ol className="grid gap-4">
        {(isMentor
          ? ["Set up your profile and skills", "Accept the mentees you want to help", "Set each of them a route"]
          : ["Tell us your skills and goals", "Pick a mentor who shares them", "Get a route to your first role"]
        ).map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i === 0 ? "bg-tape-yellow text-ink" : "bg-gray-100 text-ink-soft"}`}>
              {i + 1}
            </span>
            <span className={i === 0 ? "font-semibold" : "text-ink-soft"}>{s}</span>
          </li>
        ))}
      </ol>
      <Link
        href={next}
        className="mt-8 flex h-12 items-center justify-center gap-2 rounded-[10px] bg-tape-yellow text-base font-bold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#ffdb63]"
      >
        Set up my profile <ArrowRight className="size-5" aria-hidden="true" />
      </Link>
      {!isMentor && (
        <Link href="/browse" className="mt-3 block text-center text-[15px] font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 hover:decoration-ink">
          Browse mentors first
        </Link>
      )}
    </AuthShell>
  );
}
