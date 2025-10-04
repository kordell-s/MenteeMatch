"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Sparkles, TrendingUp, Brain, Zap, Clock } from "lucide-react";
import MentorCard from "./MentorCard";

interface SmartMatch {
  mentorId: string;
  score: number;
  rank: number;
  algorithm: string;
  mentorData: {
    name: string;
    title: string;
    company: string;
    rating: number;
    pricing: number;
    category: string;
    skills: string[];
    bio: string;
    profilePicture: string;
    location?: string;
  };
}

interface SmartRecommendationsResponse {
  matches: SmartMatch[];
  algorithm: string;
  totalMentors: number;
  success: boolean;
  error?: string;
  menteeProfile: {
    name: string;
    skills: string[];
    goals: string[];
    experienceLevel: string;
  };
}

export default function RecommendedMentors() {
  const { data: session } = useSession();
  const [smartMatches, setSmartMatches] = useState<SmartMatch[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [algorithmInfo, setAlgorithmInfo] = useState<string>("");
  const [menteeProfile, setMenteeProfile] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [loadingTime, setLoadingTime] = useState<number>(0);

  // Available goals based on the Goal enum from schema
  const availableGoals = [
    { value: "GET_INTO_TECH", label: "Get into tech" },
    { value: "TRANSITION_CAREER", label: "Career transition" },
    { value: "BUILD_PROJECTS", label: "Build projects" },
    { value: "FIND_MENTOR", label: "Find mentor" },
    { value: "INTERVIEW_PREP", label: "Interview preparation" },
    { value: "RESUME_REVIEW", label: "Resume review" },
    { value: "CAREER_GUIDANCE", label: "Career guidance" },
    { value: "LEARN_CODING", label: "Learn coding" },
    { value: "PUBLIC_SPEAKING", label: "Public speaking" },
    { value: "NETWORKING", label: "Networking" },
  ];

  // Fetch smart recommendations using your algorithm
  useEffect(() => {
    async function fetchSmartRecommendations() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const startTime = Date.now();

        console.log(
          "🔍 Fetching smart recommendations for user:",
          session.user.id
        );

        // Add progress updates
        setLoadingProgress("Loading your profile...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        setLoadingProgress("Analyzing mentors with AI...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        setLoadingProgress("Calculating semantic matches...");

        // Call your smart matching API
        const response = await fetch("/api/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            menteeId: session.user.id,
          }),
        });

        const endTime = Date.now();
        setLoadingTime(endTime - startTime);

        if (response.ok) {
          const data: SmartRecommendationsResponse = await response.json();

          if (data.success) {
            console.log(
              `✅ Got ${data.matches.length} smart matches using ${data.algorithm}`
            );
            console.log(
              "🎯 Top matches:",
              data.matches
                .slice(0, 3)
                .map(
                  (m) => `${m.mentorData.name} (${(m.score * 100).toFixed(1)}%)`
                )
            );

            setSmartMatches(data.matches);
            setAlgorithmInfo(data.algorithm);
            setMenteeProfile(data.menteeProfile);
            setUserGoals(data.menteeProfile.goals || []);
            setSelectedGoals(data.menteeProfile.goals || []);
          } else {
            console.error("❌ Smart matching failed:", data.error);
          }
        } else {
          console.error("❌ API request failed");
        }
      } catch (error) {
        console.error("Failed to fetch smart recommendations:", error);
      } finally {
        setLoading(false);
        setLoadingProgress("");
      }
    }

    fetchSmartRecommendations();
  }, [session?.user?.id]);

  const handleGoalToggle = (goalValue: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalValue)
        ? prev.filter((g) => g !== goalValue)
        : [...prev, goalValue]
    );
  };

  const handleUpdateGoals = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/user/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: selectedGoals }),
      });

      if (response.ok) {
        setUserGoals(selectedGoals);
        setIsDialogOpen(false);

        // Refresh recommendations after updating goals
        window.location.reload();
      } else {
        console.error("Failed to update goals");
      }
    } catch (error) {
      console.error("Error updating goals:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getGoalLabel = (goalValue: string) => {
    const goal = availableGoals.find((g) => g.value === goalValue);
    return goal ? goal.label : goalValue;
  };

  // Get top recommended mentors based on smart algorithm scores
  const topMatches = smartMatches.slice(0, 3);
  const otherMatches = smartMatches.slice(3, 9); // Show up to 6 more

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="flex items-center justify-center py-16">
          <div className="text-center max-w-md">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <Brain className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI is Finding Your Perfect Mentors
            </h3>
            <p className="text-purple-600 font-medium mb-2">
              {loadingProgress || "Initializing smart algorithm..."}
            </p>
            <p className="text-sm text-gray-500">
              Using TF-IDF + Word Embeddings for semantic matching
            </p>
            {loadingTime > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{(loadingTime / 1000).toFixed(1)}s elapsed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Please log in to see personalized mentor recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Smart Algorithm Indicator */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 text-xl">
              AI-Powered Smart Recommendations
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full font-medium border border-purple-200">
                {algorithmInfo}
              </span>
              {loadingTime > 0 && (
                <span className="text-xs text-gray-500">
                  • Processed in {(loadingTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-purple-800 mb-4 leading-relaxed">
          These mentors are intelligently ranked using advanced semantic
          matching that understands the <strong>meaning</strong> behind your
          profile, skills, and goals - not just keyword matching.
        </p>

        {/* Show mentee profile summary */}
        {menteeProfile && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100 shadow-sm">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your Profile Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Skills:</span>
                <p className="text-purple-700 mt-1">
                  {menteeProfile.skills?.length > 0
                    ? menteeProfile.skills.join(", ")
                    : "None set - add skills to improve matches!"}
                </p>
              </div>
              <div>
                <span className="font-medium text-purple-800">Goals:</span>
                <p className="text-purple-700 mt-1">
                  {menteeProfile.goals?.length > 0
                    ? menteeProfile.goals.map(getGoalLabel).join(", ")
                    : "None set - set goals for better recommendations!"}
                </p>
              </div>
              <div>
                <span className="font-medium text-purple-800">
                  Experience Level:
                </span>
                <p className="text-purple-700 mt-1 capitalize">
                  {menteeProfile.experienceLevel?.toLowerCase() ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Matches Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Perfect Matches for You
              </h2>
              <p className="text-gray-600 mt-1">
                Top mentors based on semantic similarity • {smartMatches.length}{" "}
                total matches found
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="text-purple-600 border-purple-200 hover:bg-purple-50 font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Goals
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Your Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select goals to improve your AI recommendations:
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableGoals.map((goal) => (
                    <div
                      key={goal.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={goal.value}
                        checked={selectedGoals.includes(goal.value)}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                      />
                      <label
                        htmlFor={goal.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {goal.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateGoals} disabled={updating}>
                    {updating ? "Updating..." : "Update Goals"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {topMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topMatches.map((match, index) => (
              <div
                key={match.mentorId}
                className="relative group hover:scale-105 transition-transform duration-200"
              >
                <MentorCard
                  mentor={{
                    id: match.mentorId,
                    name: match.mentorData.name,
                    title: match.mentorData.title || "",
                    email: "",
                    company: match.mentorData.company || "",
                    rating: match.mentorData.rating || 0,
                    skills: match.mentorData.skills || [],
                    bio: match.mentorData.bio || "",
                    languages: [],
                    experience: [],
                    role: "MENTOR" as const,
                    category: "OTHER" as any,
                    profilePicture: match.mentorData.profilePicture,
                    mentor: {
                      specialization: [],
                      pricing: null,
                    },
                  }}
                  recommended={true}
                />

                {/* Match Score Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-green-400">
                  {Math.round(match.score * 100)}% match
                </div>

                {/* Rank Badge */}
                {index === 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-yellow-300">
                    🏆 #1 Best Match
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-gray-300">
                    🥈 #2 Match
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-orange-300">
                    🥉 #3 Match
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Perfect Matches Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try updating your profile with more skills or goals to improve
              your matches!
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Your Goals
            </Button>
          </div>
        )}
      </div>

      {/* Other Great Matches */}
      {otherMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Other Great Matches
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({otherMatches.length} more mentors)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMatches.map((match) => (
              <div
                key={match.mentorId}
                className="relative group hover:scale-105 transition-transform duration-200"
              >
                <MentorCard
                  mentor={{
                    id: match.mentorId,
                    name: match.mentorData.name,
                    title: match.mentorData.title || "",
                    email: "",
                    company: match.mentorData.company || "",
                    rating: match.mentorData.rating || 0,
                    skills: match.mentorData.skills || [],
                    bio: match.mentorData.bio || "",
                    languages: [],
                    experience: [],
                    role: "MENTOR" as const,
                    category: "OTHER" as any,
                    profilePicture: match.mentorData.profilePicture,
                    mentor: {
                      specialization: [],
                      pricing: null,
                    },
                  }}
                />

                {/* Match Score Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-blue-400">
                  {Math.round(match.score * 100)}% match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && smartMatches.length > 0 && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            🔧 Debug Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p>
                <span className="font-medium">Algorithm:</span> {algorithmInfo}
              </p>
              <p>
                <span className="font-medium">Total matches:</span>{" "}
                {smartMatches.length}
              </p>
              <p>
                <span className="font-medium">User ID:</span> {session.user.id}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Processing time:</span>{" "}
                {(loadingTime / 1000).toFixed(2)}s
              </p>
              <p>
                <span className="font-medium">Top scores:</span>{" "}
                {topMatches.map((m) => Math.round(m.score * 100)).join("%, ")}%
              </p>
              <p>
                <span className="font-medium">Cache status:</span> Embeddings
                cached ✅
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
