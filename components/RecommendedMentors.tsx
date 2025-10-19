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
import { Edit, Sparkles, TrendingUp, Brain, Zap } from "lucide-react";
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
    category: string;
    skills: string[];
    bio: string;
    profilePicture: string;
    location?: string;
  };
}

interface RecommendedMentorsProps {
  mentors: any[]; // Recommended mentors from parent
  allMentors: any[]; // All mentors for fallback
  loading: boolean; // Loading state from parent
}

export default function RecommendedMentors({
  mentors,
  allMentors,
  loading,
}: RecommendedMentorsProps) {
  const { data: session } = useSession();
  const [smartMatches, setSmartMatches] = useState<SmartMatch[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [algorithmInfo, setAlgorithmInfo] =
    useState<string>("TF-IDF + Word2Vec");
  const [menteeProfile, setMenteeProfile] = useState<any>(null);

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

  // Process mentors data passed from parent
  useEffect(() => {
    if (mentors && mentors.length > 0) {
      // Convert the mentor data to SmartMatch format
      const matches: SmartMatch[] = mentors.map((match: any) => ({
        mentorId: match.mentorId,
        score: match.score,
        rank: match.rank,
        algorithm: match.algorithm || "TF-IDF + Word2Vec",
        mentorData: {
          name: match.mentorData?.name || "",
          title: match.mentorData?.title || "",
          company: match.mentorData?.company || "",
          rating: match.mentorData?.rating || 0,
          category: match.mentorData?.category || "",
          skills: match.mentorData?.skills || [],
          bio: match.mentorData?.bio || "",
          profilePicture: match.mentorData?.profilePicture || "",
          location: match.mentorData?.location,
        },
      }));

      setSmartMatches(matches);

      // Extract algorithm info and profile data if available
      if (mentors[0]?.algorithm) {
        setAlgorithmInfo(mentors[0].algorithm);
      }

      // Set mentee profile if provided
      if (mentors[0]?.menteeProfile) {
        setMenteeProfile(mentors[0].menteeProfile);
        setUserGoals(mentors[0].menteeProfile.goals || []);
        setSelectedGoals(mentors[0].menteeProfile.goals || []);
      }
    }
  }, [mentors]);

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
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-sky border-t-brand-teal mx-auto"></div>
              <Brain className="w-8 h-8 text-brand-teal absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-brand-navy mb-2">
              AI is Finding Your Perfect Mentors
            </h3>
            <p className="text-brand-teal font-medium mb-2">
              Analyzing mentors with semantic matching...
            </p>
            <p className="text-sm text-gray-600">
              Using TF-IDF + Word Embeddings for intelligent recommendations
            </p>
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
      <div className="bg-gradient-to-r from-brand-sky/20 via-brand-teal/10 to-brand-sky/20 border-2 border-brand-teal/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-brand-teal to-brand-navy rounded-xl shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy text-xl">
              AI-Powered Smart Recommendations
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-brand-orange" />
              <span className="text-sm bg-brand-gold/20 text-brand-navy px-3 py-1 rounded-full font-medium border border-brand-gold">
                {algorithmInfo}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          These mentors are intelligently ranked using advanced semantic
          matching that understands the{" "}
          <strong className="text-brand-teal">meaning</strong> behind your
          profile, skills, and goals - not just keyword matching.
        </p>

        {/* Show mentee profile summary */}
        {menteeProfile && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-brand-sky/50 shadow-sm">
            <h4 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              Your Profile Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-brand-teal">Skills:</span>
                <p className="text-gray-700 mt-1">
                  {menteeProfile.skills?.length > 0
                    ? menteeProfile.skills.join(", ")
                    : "None set - add skills to improve matches!"}
                </p>
              </div>
              <div>
                <span className="font-medium text-brand-teal">Goals:</span>
                <p className="text-gray-700 mt-1">
                  {menteeProfile.goals?.length > 0
                    ? menteeProfile.goals.map(getGoalLabel).join(", ")
                    : "None set - set goals for better recommendations!"}
                </p>
              </div>
              <div>
                <span className="font-medium text-brand-teal">
                  Experience Level:
                </span>
                <p className="text-gray-700 mt-1 capitalize">
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
            <div className="p-2 bg-gradient-to-r from-brand-teal to-brand-navy rounded-lg shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brand-navy">
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
                className="text-brand-teal border-brand-teal hover:bg-brand-teal hover:text-white font-medium transition-all"
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
                    },
                  }}
                  recommended={true}
                />

                {/* Match Score Badge */}
                <div className="absolute top-2 right-2 bg-brand-teal/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                  {Math.round(match.score * 100)}%
                </div>

                {/* Rank Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-brand-gold/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                    #1
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute top-2 left-2 bg-gray-400/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                    #2
                  </div>
                )}
                {index === 2 && (
                  <div className="absolute top-2 left-2 bg-brand-orange/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                    #3
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-sky/10 rounded-xl border-2 border-dashed border-brand-sky">
            <Brain className="w-12 h-12 text-brand-teal mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-brand-navy mb-2">
              No Perfect Matches Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try updating your profile with more skills or goals to improve
              your matches!
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-brand-teal hover:bg-brand-navy text-white"
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
            <Sparkles className="w-6 h-6 text-brand-gold" />
            <span className="text-brand-navy">Other Great Matches</span>
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
                    },
                  }}
                />

                {/* Match Score Badge */}
                <div className="absolute top-2 right-2 bg-brand-sky/90 backdrop-blur-sm text-brand-navy text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                  {Math.round(match.score * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && smartMatches.length > 0 && (
        <div className="bg-brand-sky/10 border-2 border-brand-sky rounded-lg p-4 text-sm">
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
