"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import MilestoneCard from "@/components/roadmap/MilestoneCard";
import ProgressBar from "@/components/roadmap/ProgressBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Target,
  CheckCircle2,
  ListTodo,
  Edit,
  Archive,
  Play,
  Pause,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  order: number;
  dueDate: string;
  status: string;
  completedAt?: string;
  tasks: { id: string; title: string; completed: boolean }[];
  checkIns: {
    id: string;
    scheduledDate: string;
    status: string;
    mentorNotes?: string;
  }[];
  resources: {
    id: string;
    title: string;
    url: string;
    resourceType: string;
  }[];
}

interface Roadmap {
  id: string;
  title: string;
  description?: string;
  duration: number;
  focusArea: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  mentorship: {
    id: string;
    mentor: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    mentee: {
      id: string;
      name: string;
      profilePicture?: string;
    };
  };
  milestones: Milestone[];
  progress: {
    milestones: {
      total: number;
      completed: number;
      percentage: number;
    };
    tasks: {
      total: number;
      completed: number;
      percentage: number;
    };
  };
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");

  const roadmapId = params.roadmapId as string;
  const isMentor =
    session?.user?.id === roadmap?.mentorship?.mentor?.id;

  useEffect(() => {
    fetchRoadmap();
  }, [roadmapId]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`);
      if (!response.ok) throw new Error("Failed to fetch roadmap");

      const data = await response.json();
      setRoadmap(data);
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      alert("Failed to load roadmap");
      router.push("/dashboard/roadmaps");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    milestoneId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update milestone");

      // Refresh roadmap
      fetchRoadmap();
    } catch (error) {
      console.error("Error updating milestone:", error);
      alert("Failed to update milestone status");
    }
  };

  const handleAddResource = async (
    milestoneId: string,
    resource: { title: string; url: string; resourceType: string }
  ) => {
    try {
      const response = await fetch(
        `/api/milestones/${milestoneId}/resources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resource),
        }
      );

      if (!response.ok) throw new Error("Failed to add resource");

      // Refresh roadmap
      fetchRoadmap();
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource");
    }
  };

  const handleScheduleCheckIn = async (
    milestoneId: string,
    checkIn: { scheduledDate: string; mentorNotes?: string }
  ) => {
    try {
      const response = await fetch(
        `/api/milestones/${milestoneId}/check-ins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...checkIn, createSession: true }),
        }
      );

      if (!response.ok) throw new Error("Failed to schedule check-in");

      // Refresh roadmap
      fetchRoadmap();
    } catch (error) {
      console.error("Error scheduling check-in:", error);
      alert("Failed to schedule check-in");
    }
  };

  const handleRoadmapStatusChange = async (newStatus: string) => {
    if (
      !confirm(
        `Are you sure you want to ${newStatus.toLowerCase()} this roadmap?`
      )
    )
      return;

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update roadmap");

      // Refresh
      fetchRoadmap();
    } catch (error) {
      console.error("Error updating roadmap:", error);
      alert("Failed to update roadmap status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Roadmap not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500 text-white">Active</Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500 text-white">Completed</Badge>
        );
      case "PAUSED":
        return (
          <Badge className="bg-yellow-500 text-white">Paused</Badge>
        );
      case "ARCHIVED":
        return (
          <Badge className="bg-gray-500 text-white">Archived</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/roadmaps")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roadmaps
        </Button>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(roadmap.status)}
              <Badge className="bg-brand-teal text-white">
                {roadmap.duration} weeks
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-brand-navy mb-2">
              {roadmap.title}
            </h1>
            {roadmap.description && (
              <p className="text-gray-600 mb-3">{roadmap.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Focus: {roadmap.focusArea}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(roadmap.startDate).toLocaleDateString()} -{" "}
                  {new Date(roadmap.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {isMentor && roadmap.status === "ACTIVE" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleRoadmapStatusChange("PAUSED")}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRoadmapStatusChange("ARCHIVED")}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          )}

          {isMentor && roadmap.status === "PAUSED" && (
            <Button
              className="bg-brand-teal hover:bg-brand-navy text-white"
              onClick={() => handleRoadmapStatusChange("ACTIVE")}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
        </div>

        {/* Participant Info */}
        <div className="bg-brand-sky/10 p-4 rounded-lg border border-brand-sky/20 mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mentor:</span>
              <span className="font-medium text-brand-navy">
                {roadmap.mentorship.mentor.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mentee:</span>
              <span className="font-medium text-brand-navy">
                {roadmap.mentorship.mentee.name}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-navy flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                Milestone Progress
              </h3>
              <span className="text-2xl font-bold text-brand-navy">
                {roadmap.progress.milestones.completed}/
                {roadmap.progress.milestones.total}
              </span>
            </div>
            <ProgressBar
              percentage={roadmap.progress.milestones.percentage}
              label=""
              showLabel={false}
              colorScheme="teal"
              size="lg"
            />
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-navy flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-brand-gold" />
                Task Progress
              </h3>
              <span className="text-2xl font-bold text-brand-navy">
                {roadmap.progress.tasks.completed}/{roadmap.progress.tasks.total}
              </span>
            </div>
            <ProgressBar
              percentage={roadmap.progress.tasks.percentage}
              label=""
              showLabel={false}
              colorScheme="gold"
              size="lg"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === "timeline" ? "default" : "outline"}
            onClick={() => setViewMode("timeline")}
            className={
              viewMode === "timeline"
                ? "bg-brand-teal hover:bg-brand-navy text-white"
                : ""
            }
          >
            Timeline View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-brand-teal hover:bg-brand-navy text-white"
                : ""
            }
          >
            List View
          </Button>
        </div>
      </div>

      {/* Timeline or List View */}
      {viewMode === "timeline" ? (
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-navy mb-6">
            Journey Timeline
          </h2>
          <RoadmapTimeline
            milestones={roadmap.milestones}
            layout="vertical"
            onMilestoneClick={(milestone) => {
              // Scroll to milestone in list
              setViewMode("list");
              setTimeout(() => {
                document
                  .getElementById(`milestone-${milestone.id}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-navy mb-4">
            Milestones
          </h2>
          {roadmap.milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone) => (
              <div key={milestone.id} id={`milestone-${milestone.id}`}>
                <MilestoneCard
                  milestone={milestone}
                  isMentor={isMentor}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(milestone.id, newStatus)
                  }
                  onAddResource={(resource) =>
                    handleAddResource(milestone.id, resource)
                  }
                  onScheduleCheckIn={(checkIn) =>
                    handleScheduleCheckIn(milestone.id, checkIn)
                  }
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
