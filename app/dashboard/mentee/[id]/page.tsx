"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Star,
  Target,
  Award,
  Globe,
  Loader2,
} from "lucide-react";

interface MenteeProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio: string;
  skills: string[];
  location?: string;
  company?: string;
  title?: string;
  experienceLevel: string;
  school?: string;
  languages: string[];
  mentee: {
    goals: string[];
    detailedGoals?: string;
    rating?: number;
  };
}

export default function MenteeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const menteeId = params.id as string;

  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenteeProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/mentee/${menteeId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch mentee profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching mentee profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load mentee profile"
        );
      } finally {
        setLoading(false);
      }
    }

    if (menteeId) {
      fetchMenteeProfile();
    }
  }, [menteeId]);

  // Format experience level for display
  const formatExperienceLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      ENTRY: "Entry Level",
      INTERMEDIATE: "Intermediate",
      ADVANCED: "Advanced",
      EXPERT: "Expert",
    };
    return levels[level] || level;
  };

  // Format goals for display
  const formatGoal = (goal: string) => {
    const goals: { [key: string]: string } = {
      GET_INTO_TECH: "Get into Tech",
      TRANSITION_CAREER: "Career Transition",
      BUILD_PROJECTS: "Build Projects",
      FIND_MENTOR: "Find Mentor",
      INTERVIEW_PREP: "Interview Preparation",
      RESUME_REVIEW: "Resume Review",
      CAREER_GUIDANCE: "Career Guidance",
      LEARN_CODING: "Learn Coding",
      PUBLIC_SPEAKING: "Public Speaking",
      NETWORKING: "Networking",
    };
    return goals[goal] || goal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading mentee profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Profile
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Mentee profile not found</p>
              <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-brand-sky/30"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full border-4 border-brand-sky/30 bg-brand-teal flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-brand-navy mb-2">
                    {profile.name}
                  </h1>
                  {profile.title && (
                    <p className="text-lg text-gray-700 mb-2">{profile.title}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {profile.company && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.company}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.school && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{profile.school}</span>
                      </div>
                    )}
                  </div>
                </div>
                {profile.mentee.rating && (
                  <div className="flex items-center gap-1 bg-brand-gold/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                    <span className="font-semibold text-brand-navy">
                      {profile.mentee.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-brand-teal/20 text-brand-teal border-brand-teal">
                  <Award className="w-3 h-3 mr-1" />
                  {formatExperienceLevel(profile.experienceLevel)}
                </Badge>
                {profile.languages.length > 0 && (
                  <Badge variant="outline">
                    <Globe className="w-3 h-3 mr-1" />
                    {profile.languages.join(", ")}
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Mentee
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-navy">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {profile.bio || "No bio provided"}
          </p>
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-navy">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-brand-sky/20 text-brand-navy hover:bg-brand-sky/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-navy flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-teal" />
            Goals & Aspirations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.mentee.goals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Goal Categories:
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.mentee.goals.map((goal, index) => (
                  <Badge
                    key={index}
                    className="bg-brand-teal/20 text-brand-teal border-brand-teal"
                  >
                    {formatGoal(goal)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.mentee.detailedGoals && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Detailed Goals:
              </h4>
              <div className="bg-brand-sky/10 rounded-lg p-4 border border-brand-sky/30">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.mentee.detailedGoals}
                </p>
              </div>
            </div>
          )}

          {profile.mentee.goals.length === 0 && !profile.mentee.detailedGoals && (
            <p className="text-gray-500 italic">No goals specified yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-brand-sky/10 to-brand-teal/10 border-brand-teal/30">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-brand-navy mb-4">
            Ready to connect with {profile.name.split(" ")[0]}?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/dashboard/requests")}
              className="bg-brand-teal hover:bg-brand-navy"
            >
              View All Requests
            </Button>
            <Button variant="outline">Schedule a Session</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
