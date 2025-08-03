"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  description?: string;
  offeringType?: string;
  mentor?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  mentee?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

interface UserRole {
  role: "mentor" | "mentee";
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userRole, setUserRole] = useState<"mentor" | "mentee" | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (session?.user?.id) {
      fetchUserRoleAndSessions();
    }
  }, [session, status, router]);

  const fetchUserRoleAndSessions = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      // Get current user data including role
      const userResponse = await fetch("/api/auth/user");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      const normalizedRole = userData.role.toLowerCase() as "mentor" | "mentee";
      setUserRole(normalizedRole);

      // Fetch sessions for the authenticated user
      const sessionsResponse = await fetch(
        `/api/sessions?role=${userData.role}`
      );

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      if (response.ok) {
        // Refresh sessions
        fetchUserRoleAndSessions();
      } else {
        alert("Failed to cancel session");
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      alert("Failed to cancel session");
    }
  };

  const handleJoinSession = (sessionId: string) => {
    // Navigate to session room or video call
    router.push(`/dashboard/sessions/${sessionId}/join`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ProfileImage = ({
    src,
    alt,
    size = 40,
  }: {
    src?: string;
    alt: string;
    size?: number;
  }) => (
    <Image
      src={src || "/images/default-avatar.png"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
    />
  );

  const filterSessionsByStatus = (status: string) => {
    return sessions.filter((session) => {
      if (status === "upcoming") {
        return session.status === "CONFIRMED" || session.status === "PENDING";
      }
      if (status === "completed") {
        return session.status === "COMPLETED";
      }
      if (status === "cancelled") {
        return session.status === "CANCELLED";
      }
      return false;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sessions...</div>
      </div>
    );
  }

  const upcomingSessions = filterSessionsByStatus("upcoming");
  const completedSessions = filterSessionsByStatus("completed");
  const cancelledSessions = filterSessionsByStatus("cancelled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <p className="text-gray-600">
            {userRole === "mentor"
              ? "Manage your mentoring sessions"
              : "Track your learning sessions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {userRole === "mentor" ? "Mentor" : "Mentee"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <ProfileImage
                        src={
                          userRole === "mentor"
                            ? session.mentee?.profilePicture
                            : session.mentor?.profilePicture
                        }
                        alt={
                          userRole === "mentor"
                            ? session.mentee?.name || "Mentee"
                            : session.mentor?.name || "Mentor"
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {session.title}
                          </h3>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{session.status}</span>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {session.time} ({session.duration} minutes)
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {userRole === "mentor"
                              ? `Session with ${session.mentee?.name}`
                              : `Session with ${session.mentor?.name}`}
                          </div>
                          {session.offeringType && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {session.offeringType}
                            </div>
                          )}
                        </div>

                        {session.description && (
                          <p className="text-sm text-gray-700 mt-3 p-2 bg-gray-50 rounded">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(session)}
                      >
                        View Details
                      </Button>

                      {session.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinSession(session.id)}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming sessions
                </h3>
                <p className="text-gray-600">
                  {userRole === "mentor"
                    ? "You don't have any upcoming mentoring sessions."
                    : "You don't have any upcoming learning sessions."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length > 0 ? (
            completedSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <ProfileImage
                        src={
                          userRole === "mentor"
                            ? session.mentee?.profilePicture
                            : session.mentor?.profilePicture
                        }
                        alt={
                          userRole === "mentor"
                            ? session.mentee?.name || "Mentee"
                            : session.mentor?.name || "Mentor"
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {session.title}
                          </h3>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {userRole === "mentor"
                              ? `Session with ${session.mentee?.name}`
                              : `Session with ${session.mentor?.name}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(session)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No completed sessions
                </h3>
                <p className="text-gray-600">
                  Completed sessions will appear here after they're finished.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledSessions.length > 0 ? (
            cancelledSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow opacity-75"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <ProfileImage
                        src={
                          userRole === "mentor"
                            ? session.mentee?.profilePicture
                            : session.mentor?.profilePicture
                        }
                        alt={
                          userRole === "mentor"
                            ? session.mentee?.name || "Mentee"
                            : session.mentor?.name || "Mentor"
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {session.title}
                          </h3>
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelled
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {userRole === "mentor"
                              ? `Session with ${session.mentee?.name}`
                              : `Session with ${session.mentor?.name}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(session)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No cancelled sessions
                </h3>
                <p className="text-gray-600">
                  Cancelled sessions will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Full information about this session
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="font-medium">Title</Label>
                <p className="text-sm text-gray-600">{selectedSession.title}</p>
              </div>

              <div>
                <Label className="font-medium">Date & Time</Label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSession.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {selectedSession.time}
                </p>
              </div>

              <div>
                <Label className="font-medium">Duration</Label>
                <p className="text-sm text-gray-600">
                  {selectedSession.duration} minutes
                </p>
              </div>

              <div>
                <Label className="font-medium">
                  {userRole === "mentor" ? "Mentee" : "Mentor"}
                </Label>
                <p className="text-sm text-gray-600">
                  {userRole === "mentor"
                    ? selectedSession.mentee?.name
                    : selectedSession.mentor?.name}
                </p>
              </div>

              {selectedSession.offeringType && (
                <div>
                  <Label className="font-medium">Session Type</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSession.offeringType}
                  </p>
                </div>
              )}

              {selectedSession.description && (
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSession.description}
                  </p>
                </div>
              )}

              <div>
                <Label className="font-medium">Status</Label>
                <Badge className={getStatusColor(selectedSession.status)}>
                  {getStatusIcon(selectedSession.status)}
                  <span className="ml-1">{selectedSession.status}</span>
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
