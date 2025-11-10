"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RoadmapCard from "@/components/roadmap/RoadmapCard";
import RoadmapWizard from "@/components/roadmap/RoadmapWizard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  Map,
  TrendingUp,
  CheckCircle2,
  Pause,
  Archive,
} from "lucide-react";

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
  isTemplate: boolean;
  mentorship: {
    id: string;
    mentee: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    mentor: {
      id: string;
      name: string;
      profilePicture?: string;
    };
  };
  milestones: {
    id: string;
    status: string;
    tasks?: { id: string; completed: boolean }[];
  }[];
}

export default function RoadmapsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mentorships, setMentorships] = useState<
    { id: string; mentee: { name: string } }[]
  >([]);

  const isMentor = session?.user?.role === "MENTOR";

  useEffect(() => {
    fetchRoadmaps();
    if (isMentor) {
      fetchMentorships();
    }
  }, [statusFilter]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      const response = await fetch(`/api/roadmaps?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch roadmaps");

      const data = await response.json();
      setRoadmaps(data.roadmaps);
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorships = async () => {
    try {
      const response = await fetch("/api/mentorships?status=ACCEPTED");
      if (!response.ok) throw new Error("Failed to fetch mentorships");

      const data = await response.json();
      setMentorships(data.mentorships || []);
    } catch (error) {
      console.error("Error fetching mentorships:", error);
    }
  };

  const handleArchive = async (roadmapId: string) => {
    if (!confirm("Are you sure you want to archive this roadmap?")) return;

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (!response.ok) throw new Error("Failed to archive roadmap");

      // Refresh list
      fetchRoadmaps();
    } catch (error) {
      console.error("Error archiving roadmap:", error);
      alert("Failed to archive roadmap. Please try again.");
    }
  };

  const handleCreateRoadmap = (mentorshipId: string, menteeName: string) => {
    setSelectedMentorship({ id: mentorshipId, name: menteeName });
    setWizardOpen(true);
  };

  const getStats = () => {
    return {
      total: roadmaps.length,
      active: roadmaps.filter((r) => r.status === "ACTIVE").length,
      completed: roadmaps.filter((r) => r.status === "COMPLETED").length,
      paused: roadmaps.filter((r) => r.status === "PAUSED").length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-2">
              <Map className="h-8 w-8 text-brand-teal" />
              {isMentor ? "My Roadmaps" : "My Learning Roadmap"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isMentor
                ? "Track and manage mentorship roadmaps"
                : "Track your progress and upcoming milestones"}
            </p>
          </div>
          {isMentor && mentorships.length > 0 && (
            <Select
              onValueChange={(value) => {
                const mentorship = mentorships.find((m) => m.id === value);
                if (mentorship) {
                  handleCreateRoadmap(value, mentorship.mentee.name);
                }
              }}
            >
              <SelectTrigger asChild>
                <Button className="bg-brand-teal hover:bg-brand-navy text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roadmap
                </Button>
              </SelectTrigger>
              <SelectContent>
                {mentorships.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.mentee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-sky/20 rounded-lg">
                <Map className="h-5 w-5 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Roadmaps</p>
                <p className="text-2xl font-bold text-brand-navy">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Pause className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.paused}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Roadmaps Grid */}
      {roadmaps.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No roadmaps found
          </h3>
          <p className="text-gray-600 mb-4">
            {isMentor
              ? "Create your first roadmap to get started"
              : "Your mentor hasn't created a roadmap yet"}
          </p>
          {isMentor && mentorships.length > 0 && (
            <Select
              onValueChange={(value) => {
                const mentorship = mentorships.find((m) => m.id === value);
                if (mentorship) {
                  handleCreateRoadmap(value, mentorship.mentee.name);
                }
              }}
            >
              <SelectTrigger asChild>
                <Button className="bg-brand-teal hover:bg-brand-navy text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Roadmap
                </Button>
              </SelectTrigger>
              <SelectContent>
                {mentorships.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.mentee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roadmaps.map((roadmap) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              onArchive={handleArchive}
              isMentor={isMentor}
            />
          ))}
        </div>
      )}

      {/* Roadmap Creation Wizard */}
      {selectedMentorship && (
        <RoadmapWizard
          open={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedMentorship(null);
            fetchRoadmaps(); // Refresh list
          }}
          mentorshipId={selectedMentorship.id}
          menteeName={selectedMentorship.name}
        />
      )}
    </div>
  );
}
