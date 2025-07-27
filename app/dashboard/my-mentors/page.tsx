"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Star,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MenteeDashboardData } from "@/app/types/dashboard/menteeDashboardData";
import { useSession } from "next-auth/react";

export default function MenteeDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] =
    useState<MenteeDashboardData | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    topic: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // Use session user ID and determine API endpoint based on role
    if (session?.user?.id) {
      // If user is a mentor, fetch mentee data; if mentee, fetch mentor data
      const apiEndpoint =
        session.user.role === "MENTOR"
          ? `/api/dashboard/mentor?id=${session.user.id}`
          : `/api/dashboard/mentee?id=${session.user.id}`;

      fetchDashboardData(session.user.id, apiEndpoint);
    }
  }, [status, session]);

  const fetchDashboardData = async (userId: string, endpoint?: string) => {
    try {
      const apiUrl = endpoint || `/api/dashboard/mentee?id=${userId}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  const { mentorInfo, tasks, upcomingSessions, completedSessions, progress } =
    dashboardData;

  // Update labels based on user role
  const isUserMentor = session?.user?.role === "MENTOR";
  const relationshipLabel = isUserMentor ? "My Mentees" : "My Mentor";
  const personInfo = isUserMentor
    ? dashboardData.menteeInfo || mentorInfo
    : mentorInfo;

  const handleMessage = () => {
    if (personInfo) {
      const partnerId = isUserMentor ? personInfo.id : mentorInfo?.id;
      router.push(
        `/dashboard/messages?${
          isUserMentor ? "menteeId" : "mentorId"
        }=${partnerId}`
      );
    }
  };

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    // Validate required fields
    if (!bookingData.date || !bookingData.time || !bookingData.topic) {
      alert("Please fill in all required fields (Date, Time, and Topic)");
      return;
    }

    try {
      // Use session user ID
      if (!session?.user?.id) {
        alert("Please log in to book a session");
        return;
      }

      // Combine date and time into a single datetime string
      const sessionDateTime = new Date(
        `${bookingData.date}T${bookingData.time}`
      );

      // Adjust the booking logic based on user role
      const requestBody = isUserMentor
        ? {
            mentorId: session.user.id,
            menteeId: personInfo?.id,
            title: bookingData.topic,
            date: sessionDateTime.toISOString(),
            topic: bookingData.topic,
            notes: bookingData.notes,
            status: "CONFIRMED", // Mentors can confirm their own sessions
          }
        : {
            mentorId: mentorInfo?.id,
            menteeId: session.user.id,
            title: bookingData.topic,
            date: sessionDateTime.toISOString(),
            topic: bookingData.topic,
            notes: bookingData.notes,
            status: "PENDING", // Mentees book pending sessions
          };

      const response = await fetch("/api/sessions/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Session booked successfully:", result);

        setShowBookingModal(false);
        setBookingData({ date: "", time: "", topic: "", notes: "" });

        // Refresh dashboard data to show the new session
        if (session?.user?.id) {
          const apiEndpoint =
            session.user.role === "MENTOR"
              ? `/api/dashboard/mentor?id=${session.user.id}`
              : `/api/dashboard/mentee?id=${session.user.id}`;
          fetchDashboardData(session.user.id, apiEndpoint);
        }

        const successMessage = isUserMentor
          ? "Session scheduled successfully!"
          : "Session booked successfully! Your mentor will confirm the session.";
        alert(successMessage);
      } else {
        const error = await response.json();
        console.error("Error booking session:", error);
        alert(`Failed to book session: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Failed to book session. Please try again.");
    }
  };

  const handleJoinSession = (sessionId: string) => {
    router.push(`/dashboard/sessions/${sessionId}`);
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        // Refresh dashboard data
        if (session?.user?.id) {
          fetchDashboardData(session.user.id);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      if (!session?.user?.id) {
        alert("Please log in to cancel sessions");
        return;
      }

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
          userId: session.user.id, // Use session ID
        }),
      });

      if (response.ok) {
        // Refresh dashboard data with correct endpoint
        const apiEndpoint =
          session.user.role === "MENTOR"
            ? `/api/dashboard/mentor?id=${session.user.id}`
            : `/api/dashboard/mentee?id=${session.user.id}`;
        fetchDashboardData(session.user.id, apiEndpoint);
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
    }
  };

  // Show loading while session is loading
  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{relationshipLabel}</h1>
        <p className="text-gray-600">
          {isUserMentor
            ? "Your current mentees and their progress"
            : "Your current mentor and progress"}
        </p>
      </div>

      {personInfo ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Image
                  src={personInfo.profilePicture || "/images/avatar.png"}
                  alt={personInfo.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-lg">{personInfo.name}</CardTitle>
                  <CardDescription>
                    {personInfo.title}{" "}
                    {personInfo.company && `at ${personInfo.company}`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm ml-1">
                  {personInfo.rating || "N/A"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">{personInfo.bio}</p>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Progress:</span> {progress}%
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleMessage}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button className="flex-1" onClick={handleBookSession}>
              <Calendar className="h-4 w-4 mr-2" />
              {isUserMentor ? "Schedule Session" : "Book Session"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="text-gray-500">
          {isUserMentor
            ? "You don't have any mentees assigned yet."
            : "You don't have a mentor assigned yet."}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            Stay prepared for your upcoming sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleString()}
                    </p>
                    {(session as any).topic && (
                      <p className="text-sm text-gray-500 mt-1">
                        Topic: {(session as any).topic}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      {session.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                    >
                      View
                    </Button>
                    {session.status === "UPCOMING" && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinSession(session.id)}
                      >
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No upcoming sessions.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Sessions</CardTitle>
          <CardDescription>Review your learning history</CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length > 0 ? (
            <ul className="space-y-3">
              {completedSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex justify-between items-center border p-3 rounded-md text-sm"
                >
                  <div>
                    <div className="font-medium">{session.title}</div>
                    <div className="text-gray-600">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                    >
                      View Details
                    </Button>
                    {(session as any).rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm ml-1">
                          {(session as any).rating}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No sessions completed yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>
            Keep up with your mentor-assigned tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex justify-between items-center p-3 border rounded-md text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-gray-600 text-xs mt-1">
                        {task.description}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="text-gray-500 text-xs mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.status === "COMPLETED" ? "default" : "outline"
                      }
                    >
                      {task.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTask(task)}
                    >
                      View
                    </Button>
                    {task.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskAction(task.id, "COMPLETE")}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
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
                  {new Date(selectedSession.date).toLocaleString()}
                </p>
              </div>
              {(selectedSession as any).topic && (
                <div>
                  <Label className="font-medium">Topic</Label>
                  <p className="text-sm text-gray-600">
                    {(selectedSession as any).topic}
                  </p>
                </div>
              )}
              {selectedSession.notes && (
                <div>
                  <Label className="font-medium">Notes</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSession.notes}
                  </p>
                </div>
              )}
              <div>
                <Label className="font-medium">Status</Label>
                <Badge variant="outline" className="ml-2">
                  {selectedSession.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowSessionModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="font-medium">Title</Label>
                <p className="text-sm text-gray-600">{selectedTask.title}</p>
              </div>
              {selectedTask.description && (
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="text-sm text-gray-600">
                    {selectedTask.description}
                  </p>
                </div>
              )}
              {selectedTask.dueDate && (
                <div>
                  <Label className="font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <Label className="font-medium">Status</Label>
                <Badge
                  variant={
                    selectedTask.status === "COMPLETED" ? "default" : "outline"
                  }
                  className="ml-2"
                >
                  {selectedTask.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedTask?.status !== "COMPLETED" && (
              <Button
                onClick={() => {
                  handleTaskAction(selectedTask.id, "COMPLETE");
                  setShowTaskModal(false);
                }}
              >
                Mark Complete
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Session Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isUserMentor ? "Schedule a Session" : "Book a Session"}
            </DialogTitle>
            <DialogDescription>
              {isUserMentor
                ? `Schedule a session with ${personInfo?.name}`
                : `Schedule a session with ${mentorInfo?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) =>
                  setBookingData({ ...bookingData, date: e.target.value })
                }
                className="col-span-3"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={bookingData.time}
                onChange={(e) =>
                  setBookingData({ ...bookingData, time: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Topic *
              </Label>
              <Input
                id="topic"
                value={bookingData.topic}
                onChange={(e) =>
                  setBookingData({ ...bookingData, topic: e.target.value })
                }
                className="col-span-3"
                placeholder="Session topic"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={bookingData.notes}
                onChange={(e) =>
                  setBookingData({ ...bookingData, notes: e.target.value })
                }
                className="col-span-3"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleBookingSubmit}
              disabled={
                !bookingData.date || !bookingData.time || !bookingData.topic
              }
            >
              Book Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
