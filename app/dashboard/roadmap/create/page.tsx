"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import RoadmapWizard from "@/components/roadmap/RoadmapWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateRoadmapPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mentorship, setMentorship] = useState<{
    id: string;
    menteeName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const mentorshipId = searchParams.get("mentorshipId");

  useEffect(() => {
    // Verify user is mentor
    if (session?.user?.role !== "MENTOR") {
      router.push("/dashboard");
      return;
    }

    if (!mentorshipId) {
      alert("No mentorship selected");
      router.push("/dashboard/roadmaps");
      return;
    }

    fetchMentorship();
  }, [mentorshipId, session]);

  const fetchMentorship = async () => {
    if (!mentorshipId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/mentorships/${mentorshipId}`);
      if (!response.ok) throw new Error("Failed to fetch mentorship");

      const data = await response.json();
      setMentorship({
        id: data.id,
        menteeName: data.mentee.name,
      });
    } catch (error) {
      console.error("Error fetching mentorship:", error);
      alert("Failed to load mentorship details");
      router.push("/dashboard/roadmaps");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!mentorship) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/roadmaps")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Roadmaps
      </Button>

      <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-lg">
        <h1 className="text-2xl font-bold text-brand-navy mb-2">
          Create Roadmap for {mentorship.menteeName}
        </h1>
        <p className="text-gray-600 mb-6">
          Design a customized learning roadmap with milestones, resources, and
          check-ins to guide your mentee's journey.
        </p>

        <RoadmapWizard
          open={true}
          onClose={() => router.push("/dashboard/roadmaps")}
          mentorshipId={mentorship.id}
          menteeName={mentorship.menteeName}
        />
      </div>
    </div>
  );
}
