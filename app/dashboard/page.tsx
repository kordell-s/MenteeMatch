"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
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

  // Get user ID from session instead of hardcoded value
  const userId = session?.user?.id;

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
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

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
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
      setProcessingRequests((prev) => new Set(prev).add(requestId));

      const response = await fetch("/api/mentorship-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action: action.toUpperCase(),
          mentorId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      // Refresh dashboard data
      const mentorResponse = await fetch(`/api/dashboard/mentor?id=${userId}`);
      if (mentorResponse.ok) {
        const mentorData = await mentorResponse.json();
        setDashboardData((prev) => (prev ? { ...prev, mentorData } : null));
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(`Failed to ${action} mentorship request`);
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
    const imageSrc =
      src && src !== "/placeholder.svg" ? src : "/images/default-avatar.png";

    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleImageError}
        priority={false}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No dashboard data available</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Mentees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorData.confirmedMentees?.length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Active mentees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorData.recentRequests?.filter(
                        (r: { status: string }) => r.status === "PENDING"
                      ).length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Awaiting response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorData.upcomingSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {mentorData.upcomingSessions?.[0]
                        ? `Next: ${new Date(
                            mentorData.upcomingSessions[0].date
                          ).toLocaleDateString()}`
                        : "No sessions scheduled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Completed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorData.completedSessions || 0}
                    </div>
                    <p className="text-xs text-gray-500">Total completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mentorship Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Mentorship Requests</CardTitle>
                <CardDescription>
                  Manage your incoming mentorship requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentorData.recentRequests?.length > 0 ? (
                    mentorData.recentRequests
                      .slice(0, 5)
                      .map((request: any) => (
                        <div
                          key={request.id}
                          className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ProfileImage
                            src={request.mentee?.profilePicture}
                            alt={request.mentee?.name || "Mentee"}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {request.mentee?.name}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.message || "No message provided"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {request.mentee?.goals?.map(
                                (goal: string, index: number) => (
                                  <Badge key={index} variant="secondary">
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
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message Mentee
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex items-center">
                            {request.status === "PENDING" ? (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 border-red-200"
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
                                >
                                  {processingRequests.has(request.id)
                                    ? "Processing..."
                                    : "Accept"}
                                </Button>
                              </div>
                            ) : request.status === "ACCEPTED" ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Accepted
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
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
              <CardFooter>
                <Link href="/dashboard/my-mentees">
                  <Button variant="outline" className="w-full">
                    View All Mentees
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
              <CardFooter>
                <Link href="/dashboard/sessions">
                  <Button variant="outline" className="w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  My Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {menteeData.mentorInfo ? 1 : 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {menteeData.mentorInfo
                        ? "Active mentor"
                        : "No mentor assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    {/* <div className="text-2xl font-bold">
                      {menteeData.tasks?.filter(
                        (task) => task.status !== "COMPLETED"
                      ).length || 0}
                    </div> */}
                    <p className="text-xs text-gray-500">Pending completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Completed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {menteeData.completedSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Total completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {menteeData.upcomingSessions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {menteeData.upcomingSessions?.[0]?.title ||
                        "No sessions scheduled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Find Mentors Section - Show only if no mentor assigned */}
          {!menteeData.mentorInfo && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Find Your Perfect Mentor</CardTitle>
                <CardDescription>
                  Discover mentors who can help you achieve your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">
                    Ready to start your mentorship journey?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Browse our community of experienced mentors across various
                    fields and specialties.
                  </p>
                  <Link href="/browse">
                    <Button className="w-full max-w-md">
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Mentors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Mentor Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>My Mentor</CardTitle>
                <CardDescription>Your current mentorship</CardDescription>
              </CardHeader>
              <CardContent>
                {menteeData.mentorInfo ? (
                  <div className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <ProfileImage
                      src={menteeData.mentorInfo.profilePicture}
                      alt={menteeData.mentorInfo.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">
                          {menteeData.mentorInfo.name}
                        </h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm ml-1">
                            {menteeData.mentorInfo.rating || "N/A"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {menteeData.mentorInfo.title} at{" "}
                        {menteeData.mentorInfo.company}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {menteeData.mentorInfo.bio}
                      </p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSendMessage(menteeData.mentorInfo.id)
                          }
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" onClick={handleBookSession}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">
                      You don't have a mentor assigned yet.
                    </p>
                    <Link href="/browse">
                      <Button>Find a Mentor</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/my-mentors">
                  <Button variant="outline" className="w-full">
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
