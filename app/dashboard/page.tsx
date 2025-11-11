"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  MessageSquare,
  Calendar,
  Clock,
  Star,
  Mail,
  Users,
  CheckCircle,
  TrendingUp,
  Search,
  Map,
} from "lucide-react";
import Image from "next/image";

interface Mentor {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  profilePicture?: string;
  skills: string[];
  goals: string[];
  conversationId?: string;
}

interface DashboardData {
  userRole: "mentor" | "mentee";
  mentorData?: any;
  menteeData?: any;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set()
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: "60",
    topic: "",
    description: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [roadmapStats, setRoadmapStats] = useState<{
    total: number;
    active: number;
  } | null>(null);
  const [menteeRoadmap, setMenteeRoadmap] = useState<any>(null);

  // Get user ID from session instead of hardcoded value
  const userId = session?.user?.id;

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === "loading") return; // Still loading
    if (!session) {
      redirect("/login");
      return;
    }

    async function fetchDashboardData() {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Get user role first
        const userResponse = await fetch("/api/auth/user");
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const userRole = userData.role.toLowerCase();

        // Fetch appropriate dashboard data based on role
        if (userRole === "mentee") {
          const menteeResponse = await fetch(
            `/api/dashboard/mentee?id=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (menteeResponse.ok) {
            const menteeData = await menteeResponse.json();
            setDashboardData({
              menteeData,
              userRole: "mentee",
            });
            return;
          }
        }

        if (userRole === "mentor") {
          const mentorResponse = await fetch(
            `/api/dashboard/mentor?id=${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (mentorResponse.ok) {
            const mentorData = await mentorResponse.json();
            setDashboardData({
              mentorData,
              userRole: "mentor",
            });
            return;
          }
        }

        // If both fail, set default mentee data
        console.warn("No dashboard data found for user");
        setDashboardData({
          userRole: "mentee",
          menteeData: {
            mentorInfo: null,
            tasks: [],
            upcomingSessions: [],
            completedSessions: [],
            progress: null,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [userId, session, status, router]);

  // Fetch roadmap stats for mentors or mentee roadmap
  useEffect(() => {
    if (session?.user?.role === "MENTOR" && userId) {
      fetchRoadmapStats();
    } else if (session?.user?.role === "MENTEE" && userId) {
      fetchMenteeRoadmap();
    }
  }, [session, userId]);

  const fetchRoadmapStats = async () => {
    try {
      const response = await fetch("/api/roadmaps");
      if (response.ok) {
        const roadmaps = await response.json();
        const roadmapsArray = Array.isArray(roadmaps) ? roadmaps : [];
        setRoadmapStats({
          total: roadmapsArray.length,
          active: roadmapsArray.filter((r: any) => r.status === "ACTIVE").length,
        });
      }
    } catch (error) {
      console.error("Error fetching roadmap stats:", error);
    }
  };

  const fetchMenteeRoadmap = async () => {
    try {
      const response = await fetch("/api/roadmaps?status=ACTIVE");
      if (response.ok) {
        const roadmaps = await response.json();
        const roadmapsArray = Array.isArray(roadmaps) ? roadmaps : [];
        if (roadmapsArray.length > 0) {
          // Calculate progress for the first active roadmap
          const roadmap = roadmapsArray[0];
          const milestoneStats = {
            total: roadmap.milestones?.length || 0,
            completed: roadmap.milestones?.filter((m: any) => m.status === "COMPLETED").length || 0,
            percentage: roadmap.milestones?.length ? Math.round((roadmap.milestones.filter((m: any) => m.status === "COMPLETED").length / roadmap.milestones.length) * 100) : 0,
          };
          const allTasks = roadmap.milestones?.flatMap((m: any) => m.tasks || []) || [];
          const taskStats = {
            total: allTasks.length,
            completed: allTasks.filter((t: any) => t.completed).length,
            percentage: allTasks.length ? Math.round((allTasks.filter((t: any) => t.completed).length / allTasks.length) * 100) : 0,
          };
          setMenteeRoadmap({
            ...roadmap,
            progress: {
              milestones: milestoneStats,
              tasks: taskStats,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching mentee roadmap:", error);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-sky border-t-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!session) {
    return null; // Will redirect in useEffect
  }

  const handleMentorshipRequest = async (
    requestId: string,
    action: "accept" | "decline"
  ) => {
    try {
      console.log("🔄 Dashboard: Attempting to", action, "request:", requestId);

      setProcessingRequests((prev) => new Set(prev).add(requestId));

      const response = await fetch(`/api/mentorship-request/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action === "accept" ? "accept" : "reject",
          mentorId: userId,
        }),
      });

      console.log("📋 Dashboard: Response status:", response.status);
      const responseData = await response.json();
      console.log("📋 Dashboard: Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${action} request`);
      }

      console.log("✅ Dashboard: Request processed successfully");

      // Refresh dashboard data
      const mentorResponse = await fetch(`/api/dashboard/mentor?id=${userId}`);
      if (mentorResponse.ok) {
        const mentorData = await mentorResponse.json();
        setDashboardData((prev) => (prev ? { ...prev, mentorData } : null));
      }

      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error(`❌ Dashboard: Error ${action}ing request:`, error);
      setError(
        `Failed to ${action} mentorship request: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const handleSendMessage = (mentorId?: string) => {
    const targetId = mentorId || dashboardData?.menteeData?.mentorInfo?.id;
    if (targetId) {
      // Navigate to messages page with conversation ID or partner ID
      router.push(`/messages?partnerId=${targetId}`);
    }
  };

  // Add new function for mentor messaging mentees
  const handleSendMessageToMentee = (menteeId: string) => {
    if (menteeId) {
      router.push(`/messages?partnerId=${menteeId}`);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingLoading(true);

      const mentorId = dashboardData?.menteeData?.mentorInfo?.id;
      if (!mentorId) {
        throw new Error("No mentor selected");
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          menteeId: userId,
          date: bookingData.date,
          time: bookingData.time,
          duration: parseInt(bookingData.duration),
          title: bookingData.topic, // Use topic as title
          description: bookingData.description,
          offeringType: bookingData.topic, // Also set offeringType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book session");
      }

      // Reset form and close modal
      setBookingData({
        date: "",
        time: "",
        duration: "60",
        topic: "",
        description: "",
      });
      setShowBookingModal(false);

      // Show success message
      alert("Session booked successfully!");

      // Refresh dashboard data
      const menteeResponse = await fetch(`/api/dashboard/mentee?id=${userId}`);
      if (menteeResponse.ok) {
        const menteeData = await menteeResponse.json();
        setDashboardData((prev) => (prev ? { ...prev, menteeData } : null));
      }
    } catch (error) {
      console.error("Error booking session:", error);
      alert(
        `Failed to book session: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Add fallback image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/default-avatar.png";
  };

  // Add fallback image component
  const ProfileImage = ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string | null | undefined;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => {
    // Don't render an image if src is null/undefined
    if (!src || src === "/placeholder.svg") {
      // Create initials from the alt text (name)
      const initials =
        alt
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?";

      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-full ${className}`}
          style={{
            width: width,
            height: height,
            fontSize: width * 0.35,
            minWidth: width,
            minHeight: height,
          }}
        >
          {initials}
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={(e) => {
          // Hide the image on error - the parent will handle fallback
          e.currentTarget.style.display = "none";
        }}
        priority={false}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-sky border-t-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-brand-teal hover:bg-brand-navy">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const { userRole, mentorData, menteeData } = dashboardData;

  return (
    <div>
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Mentor Dashboard */}
      {userRole === "mentor" && mentorData && (
        <>
          {/* Roadmap Quick Access */}
          {roadmapStats && roadmapStats.total > 0 && (
            <Card className="mb-6 border-2 border-brand-teal/30 shadow-lg bg-gradient-to-r from-brand-teal/10 to-brand-sky/10">
              <CardHeader className="border-b border-brand-teal/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-brand-navy flex items-center gap-2">
                      <Map className="h-5 w-5 text-brand-teal" />
                      Active Roadmaps
                    </CardTitle>
                    <CardDescription>
                      {roadmapStats.active} of {roadmapStats.total} roadmaps in progress
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/roadmaps">
                    <Button className="bg-brand-teal hover:bg-brand-navy text-white">
                      View All Roadmaps
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="border-2 border-brand-teal/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-teal/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Mentees
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-teal/10 rounded-lg">
                    <Users className="h-8 w-8 text-brand-teal" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {mentorData.confirmedMentees?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">Active mentees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-gold/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-gold/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-gold/10 rounded-lg">
                    <Calendar className="h-8 w-8 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {mentorData.recentRequests?.filter(
                        (r: { status: string }) => r.status === "PENDING"
                      ).length || 0}
                    </div>
                    <p className="text-xs text-gray-600">Awaiting response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-orange/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-orange/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-orange/10 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-brand-orange" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {mentorData.upcomingSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      {mentorData.upcomingSessions?.[0]
                        ? `Next: ${new Date(
                            mentorData.upcomingSessions[0].date
                          ).toLocaleDateString()}`
                        : "No sessions"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-sky/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-sky/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {mentorData.completedSessions || 0}
                    </div>
                    <p className="text-xs text-gray-600">Total completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mentorship Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="lg:col-span-2 border-2 border-brand-sky/30 shadow-lg">
              <CardHeader className="border-b border-brand-sky/20 bg-brand-sky/5 p-4 md:p-6">
                <CardTitle className="text-brand-navy text-base md:text-lg">Recent Mentorship Requests</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Manage your incoming mentorship requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {mentorData.recentRequests?.length > 0 ? (
                    mentorData.recentRequests
                      .slice(0, 5)
                      .map((request: any) => (
                        <div
                          key={request.id}
                          className="flex flex-col sm:flex-row items-start gap-3 p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ProfileImage
                            src={request.mentee?.profilePicture}
                            alt={request.mentee?.name || "Mentee"}
                            width={40}
                            height={40}
                            className="rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                              <h4 className="font-medium text-sm md:text-base truncate">
                                {request.mentee?.name}
                              </h4>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                              {request.message || "No message provided"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {request.mentee?.goals?.map(
                                (goal: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="bg-brand-sky/20 text-brand-navy">
                                    {goal}
                                  </Badge>
                                )
                              )}
                            </div>
                            {/* Add message button for accepted requests */}
                            {request.status === "ACCEPTED" && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleSendMessageToMentee(
                                      request.mentee?.id
                                    )
                                  }
                                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white text-xs md:text-sm w-full sm:w-auto"
                                >
                                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  Message Mentee
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="w-full sm:w-auto sm:ml-4 flex items-center justify-end sm:justify-start">
                            {request.status === "PENDING" ? (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 border-red-300 hover:bg-red-50 text-xs md:text-sm flex-1 sm:flex-initial"
                                  onClick={() =>
                                    handleMentorshipRequest(
                                      request.id,
                                      "decline"
                                    )
                                  }
                                  disabled={processingRequests.has(request.id)}
                                >
                                  {processingRequests.has(request.id)
                                    ? "Processing..."
                                    : "Decline"}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleMentorshipRequest(
                                      request.id,
                                      "accept"
                                    )
                                  }
                                  disabled={processingRequests.has(request.id)}
                                  className="bg-brand-teal hover:bg-brand-navy text-white text-xs md:text-sm flex-1 sm:flex-initial"
                                >
                                  {processingRequests.has(request.id)
                                    ? "Processing..."
                                    : "Accept"}
                                </Button>
                              </div>
                            ) : request.status === "ACCEPTED" ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">
                                Accepted
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
                                Declined
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No mentorship requests yet
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Link href="/dashboard/my-mentees" className="w-full">
                  <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                    View All Mentees
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="border-2 border-brand-sky/30 shadow-lg">
              <CardHeader className="border-b border-brand-sky/20 bg-brand-sky/5">
                <CardTitle className="text-brand-navy">Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentorData.upcomingSessions?.length > 0 ? (
                    mentorData.upcomingSessions
                      .slice(0, 3)
                      .map((session: any) => (
                        <div
                          key={session.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{session.title}</Badge>
                            <span className="text-xs font-medium text-gray-500">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            <ProfileImage
                              src={
                                session.mentee?.profilePicture ||
                                "/placeholder.svg"
                              }
                              alt={session.mentee?.name || "Mentee"}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="ml-2 text-sm">
                              {session.mentee?.name}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(session.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming sessions
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Link href="/calendar" className="w-full">
                  <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                    View Calendar
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      {/* Mentee Dashboard */}
      {userRole === "mentee" && menteeData && (
        <>
          {/* Roadmap Progress Section */}
          {menteeRoadmap && (
            <Card className="mb-6 border-2 border-brand-teal/30 shadow-lg bg-gradient-to-r from-brand-teal/10 to-brand-sky/10">
              <CardHeader className="border-b border-brand-teal/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-brand-navy flex items-center gap-2 mb-2">
                      <Map className="h-5 w-5 text-brand-teal" />
                      {menteeRoadmap.title}
                    </CardTitle>
                    <CardDescription>
                      {menteeRoadmap.description || `${menteeRoadmap.duration} week learning journey`}
                    </CardDescription>
                  </div>
                  <Link href={`/dashboard/roadmap/${menteeRoadmap.id}`}>
                    <Button className="bg-brand-teal hover:bg-brand-navy text-white">
                      View Roadmap
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Milestone Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-teal rounded-full transition-all"
                          style={{ width: `${menteeRoadmap.progress?.milestones?.percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-brand-navy">
                        {menteeRoadmap.progress?.milestones?.completed || 0}/
                        {menteeRoadmap.progress?.milestones?.total || 0}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Task Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-gold rounded-full transition-all"
                          style={{ width: `${menteeRoadmap.progress?.tasks?.percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-brand-navy">
                        {menteeRoadmap.progress?.tasks?.completed || 0}/
                        {menteeRoadmap.progress?.tasks?.total || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="border-2 border-brand-teal/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-teal/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  My Mentors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-teal/10 rounded-lg">
                    <Users className="h-8 w-8 text-brand-teal" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {menteeData.mentorInfo ? 1 : 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      {menteeData.mentorInfo
                        ? "Active mentor"
                        : "No mentor"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-gold/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-gold/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-gold/10 rounded-lg">
                    <Calendar className="h-8 w-8 text-brand-gold" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      0
                    </div>
                    <p className="text-xs text-gray-600">Pending completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-sky/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-sky/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {menteeData.completedSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">Total completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-orange/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2 bg-brand-orange/5">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-orange/10 rounded-lg">
                    <Clock className="h-8 w-8 text-brand-orange" />
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold text-brand-navy">
                      {menteeData.upcomingSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      {menteeData.upcomingSessions?.[0]?.title ||
                        "No sessions"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Find Mentors Section - Show only if no mentor assigned */}
          {!menteeData.mentorInfo && (
            <Card className="mb-8 border-2 border-brand-teal/30 shadow-lg bg-gradient-to-r from-brand-sky/10 to-brand-teal/10">
              <CardHeader className="border-b border-brand-teal/20">
                <CardTitle className="text-brand-navy">Find Your Perfect Mentor</CardTitle>
                <CardDescription>
                  Discover mentors who can help you achieve your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-4 text-brand-navy">
                    Ready to start your mentorship journey?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Browse our community of experienced mentors across various
                    fields and specialties.
                  </p>
                  <Link href="/browse">
                    <Button className="w-full max-w-md bg-brand-teal hover:bg-brand-navy text-white font-semibold">
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Mentors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* My Mentor Section */}
            <Card className="lg:col-span-2 border-2 border-brand-sky/30 shadow-lg">
              <CardHeader className="border-b border-brand-sky/20 bg-brand-sky/5 p-4 md:p-6">
                <CardTitle className="text-brand-navy text-base md:text-lg">My Mentor</CardTitle>
                <CardDescription className="text-xs md:text-sm">Your current mentorship</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {menteeData.mentorInfo ? (
                  <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <ProfileImage
                      src={menteeData.mentorInfo.profilePicture}
                      alt={menteeData.mentorInfo.name}
                      width={60}
                      height={60}
                      className="rounded-full flex-shrink-0 self-center sm:self-start"
                    />
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h4 className="font-medium text-base md:text-lg truncate">
                          {menteeData.mentorInfo.name}
                        </h4>
                        <div className="flex items-center flex-shrink-0">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs md:text-sm ml-1">
                            {menteeData.mentorInfo.rating || "N/A"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 break-words">
                        {menteeData.mentorInfo.title} at{" "}
                        {menteeData.mentorInfo.company}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-2 break-words">
                        {menteeData.mentorInfo.bio}
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSendMessage(menteeData.mentorInfo.id)
                          }
                          className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white text-xs md:text-sm w-full sm:w-auto"
                        >
                          <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" onClick={handleBookSession} className="bg-brand-orange hover:bg-brand-gold text-white text-xs md:text-sm w-full sm:w-auto">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <p className="mb-4">
                      You don't have a mentor assigned yet.
                    </p>
                    <Link href="/browse">
                      <Button className="bg-brand-teal hover:bg-brand-navy text-white">Find a Mentor</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Link href="/dashboard/my-mentors" className="w-full">
                  <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                    View Mentor Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menteeData.upcomingSessions?.length > 0 ? (
                    menteeData.upcomingSessions
                      .slice(0, 3)
                      .map((session: any) => (
                        <div
                          key={session.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{session.title}</Badge>
                            <span className="text-xs font-medium text-gray-500">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            <ProfileImage
                              src={
                                menteeData.mentorInfo?.profilePicture ||
                                "/placeholder.svg"
                              }
                              alt={menteeData.mentorInfo?.name || "Mentor"}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="ml-2 text-sm">
                              {menteeData.mentorInfo?.name}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(session.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming sessions
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/sessions">
                  <Button variant="outline" className="w-full">
                    View All Sessions
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      {/* Session Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
            <DialogDescription>
              Schedule a mentoring session with{" "}
              {dashboardData?.menteeData?.mentorInfo?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="col-span-3"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={bookingData.time}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, time: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <select
                id="duration"
                value={bookingData.duration}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Topic
              </Label>
              <Input
                id="topic"
                value={bookingData.topic}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, topic: e.target.value }))
                }
                placeholder="Session topic"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Notes
              </Label>
              <Textarea
                id="description"
                value={bookingData.description}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Additional notes or agenda"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBookingSubmit}
              disabled={
                bookingLoading ||
                !bookingData.date ||
                !bookingData.time ||
                !bookingData.topic
              }
            >
              {bookingLoading ? "Booking..." : "Book Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
