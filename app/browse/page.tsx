import type { Metadata } from "next";
import MentorBrowser from "@/components/MentorBrowser";

export const metadata: Metadata = { title: "Find a mentor" };

export default function BrowsePage() {
  return (
    <main className="panel min-h-[100dvh]">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 sm:py-14">
        <MentorBrowser />
      </div>
    </main>
  );
}
