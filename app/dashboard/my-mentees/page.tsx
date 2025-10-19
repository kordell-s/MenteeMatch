"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MessageSquare,
  Search,
  Star,
  Clock,
  Users,
  BarChart,
  FileText,
  CheckSquare,
  User,
} from "lucide-react";
import type {
  DashboardData,
  MenteeCardData,
} from "@/app/types/dashboard/mentorDashboardData";
import type { MenteeDashboardData } from "@/app/types/dashboard/menteeDashboardData";
import TaskAssignmentModal from "@/components/TaskAssignmentModal";
import TaskCard from "@/components/TaskCard";

// Enhanced types for dynamic data
interface EnhancedMenteeData extends MenteeCardData {
  completedTasks: number;
  totalTasks: number;
  completedSessions: number;
  totalSessions: number;
  primaryGoal: string;
  progressPercentage: number;
}

interface DynamicDashboardStats {
  totalTasksCompleted: number;
  totalTasksCreated: number;
  totalSessionsCompleted: number;
  totalSessionsScheduled: number;
}

interface RecentSession {
  id: string;
  menteeName: string;
  menteeProfilePicture?: string;
  date: string;
  status: "COMPLETED" | "UPCOMING" | "CANCELLED" | "PENDING" | "CONFIRMED";
  title: string;
}

export default function MyMenteesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DynamicDashboardStats>({
    totalTasksCompleted: 0,
    totalTasksCreated: 0,
    totalSessionsCompleted: 0,
    totalSessionsScheduled: 0,
  });
  const [enhancedMentees, setEnhancedMentees] = useState<EnhancedMenteeData[]>(
    []
  );
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  const mentorId = session?.user?.id;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  // Custom hook for fetching enhanced mentee data
  const fetchEnhancedMenteeData = async (
    menteeId: string
  ): Promise<Partial<EnhancedMenteeData>> => {
    try {
      // Fetch all tasks assigned by this mentor and filter by mentee
      const tasksResponse = await fetch(`/api/tasks/mentor/${mentorId}`);
      const allTasks = tasksResponse.ok ? await tasksResponse.json() : [];

      // Filter tasks for this specific mentee
      const menteeTasks = allTasks.filter(
        (task: any) => task.menteeId === menteeId
      );

      // For sessions, we'll need to use the dashboard data or create a proper sessions endpoint
      // For now, let's use empty data until the sessions API is properly implemented
      const menteeSessions: any[] = [];

      const completedTasks = menteeTasks.filter(
        (task: any) => task.status === "COMPLETED"
      ).length;
      const totalTasks = menteeTasks.length;
      const completedSessions = menteeSessions.filter(
        (session: any) => session.status === "COMPLETED"
      ).length;
      const totalSessions = menteeSessions.length;

      // Calculate progress percentage based on completed tasks
      const progressPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        completedTasks,
        totalTasks,
        completedSessions,
        totalSessions,
        progressPercentage,
      };
    } catch (error) {
      console.error(
        `Error fetching enhanced data for mentee ${menteeId}:`,
        error
      );
      return {
        completedTasks: 0,
        totalTasks: 0,
        completedSessions: 0,
        totalSessions: 0,
        progressPercentage: 0,
      };
    }
  };

  // Fetch recent sessions across all mentees (including pending sessions)
  const fetchRecentSessions = async () => {
    if (!mentorId) return;

    try {
      // Fetch sessions from the dashboard data and also directly from sessions API
      const sessionsResponse = await fetch(`/api/sessions?role=MENTOR`);
      if (sessionsResponse.ok) {
        const allSessions = await sessionsResponse.json();

        // Sort by date and include pending sessions first, then recent ones
        const sortedSessions = allSessions
          .sort((a: any, b: any) => {
            // Prioritize pending sessions
            if (a.status === "PENDING" && b.status !== "PENDING") return -1;
            if (b.status === "PENDING" && a.status !== "PENDING") return 1;

            // Then sort by date (most recent first)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          })
          .slice(0, 5)
          .map((session: any) => ({
            id: session.id,
            menteeName: session.mentee?.name || "Unknown Mentee",
            menteeProfilePicture: session.mentee?.profilePicture,
            date: session.date,
            status: session.status,
            title: session.title || "Session",
          }));
        setRecentSessions(sortedSessions);
      }
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
    }
  };

  const fetchDashboard = async () => {
    if (!mentorId) return;

    try {
      const res = await fetch(`/api/dashboard/mentor?id=${mentorId}`);
      const data = await res.json();
      setDashboardData(data);

      // Fetch all tasks assigned by this mentor first
      const tasksRes = await fetch(`/api/tasks/mentor/${mentorId}`);
      const allMentorTasks = tasksRes.ok ? await tasksRes.json() : [];
      setAssignedTasks(allMentorTasks);

      // Fetch all sessions directly from sessions API to get most up-to-date data
      const sessionsRes = await fetch(`/api/sessions?role=MENTOR`);
      const allMentorSessions = sessionsRes.ok ? await sessionsRes.json() : [];

      // Process enhanced data for each mentee
      const enhancedMenteesData: EnhancedMenteeData[] = [];
      let totalTasksCompleted = 0;
      let totalTasksCreated = 0;
      let totalSessionsCompleted = 0;
      let totalSessionsScheduled = 0;

      for (const mentee of data.confirmedMentees || []) {
        // Filter tasks for this specific mentee
        const menteeTasks = allMentorTasks.filter(
          (task: any) => task.menteeId === mentee.id
        );

        // Filter sessions for this specific mentee from sessions API data
        const menteeSessions = allMentorSessions.filter(
          (session: any) => session.mentee?.id === mentee.id
        );

        const completedTasks = menteeTasks.filter(
          (task: any) => task.status === "COMPLETED"
        ).length;
        const totalTasks = menteeTasks.length;
        const completedSessions = menteeSessions.filter(
          (session: any) => session.status === "COMPLETED"
        ).length;
        const totalSessions = menteeSessions.length;
        const progressPercentage =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const enhancedMentee: EnhancedMenteeData = {
          ...mentee,
          completedTasks,
          totalTasks,
          completedSessions,
          totalSessions,
          primaryGoal: mentee.goals?.[0] || "No primary goal set",
          progressPercentage,
        };

        enhancedMenteesData.push(enhancedMentee);

        // Aggregate stats across all mentees
        totalTasksCompleted += completedTasks;
        totalTasksCreated += totalTasks;
        totalSessionsCompleted += completedSessions;
        totalSessionsScheduled += totalSessions;
      }

      setEnhancedMentees(enhancedMenteesData);
      setDashboardStats({
        totalTasksCompleted,
        totalTasksCreated,
        totalSessionsCompleted,
        totalSessionsScheduled,
      });

      // Fetch recent sessions using updated data
      await fetchRecentSessions();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Task updated successfully:", result);

        // Refresh dashboard data to update all counters
        await fetchDashboard();

        // Show success message
        alert(
          `Task status updated to ${newStatus
            .toLowerCase()
            .replace("_", " ")} successfully!`
        );
      } else {
        const error = await response.json();
        console.error("Error updating task status:", error);
        alert(`Failed to update task: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleSessionStatusUpdate = async (
    sessionId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // First refresh the recent sessions to show immediate update
        await fetchRecentSessions();

        // Then refresh full dashboard data to update all counters
        await fetchDashboard();

        // Show success message
        alert(
          `Session status updated to ${newStatus.toLowerCase()} successfully!`
        );
      } else {
        const error = await response.json();
        console.error("Error updating session status:", error);
        alert(`Failed to update session: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      alert("Failed to update session status. Please try again.");
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchDashboard();
    }
  }, [mentorId]);

  const refreshDashboard = async () => {
    await fetchDashboard();
  };

  // Handle View All Sessions navigation
  const handleViewAllSessions = () => {
    // CHECK: Verify a '/sessions' route doesn't already exist
    router.push("/dashboard/sessions");
  };

  // Get unique goals for filter dropdown
  const allGoals = Array.from(
    new Set(enhancedMentees.flatMap((mentee) => mentee.goals).filter(Boolean))
  );

  // Filter mentees based on search query, active tab, and goal filter
  const filteredMentees = enhancedMentees.filter((mentee) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = mentee.name.toLowerCase().includes(query);
      const goalsMatch = mentee.goals?.some((goal) =>
        goal.toLowerCase().includes(query)
      );

      if (!(nameMatch || goalsMatch)) {
        return false;
      }
    }

    // Filter by tab
    if (activeTab === "active" && mentee.status !== "active") {
      return false;
    }

    if (activeTab === "inactive" && mentee.status !== "inactive") {
      return false;
    }

    // Filter by goal
    if (goalFilter !== "all" && !mentee.goals.includes(goalFilter)) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-brand-navy">My Mentees</h1>
        <p className="text-gray-600">
          Manage your mentees and track their progress
        </p>
      </div>

      {/* Enhanced Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-brand-sky/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Mentees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-brand-teal mr-3" />
              <div>
                <div className="text-2xl font-bold text-brand-navy">
                  {enhancedMentees.length}
                </div>
                <p className="text-xs text-gray-500">
                  {enhancedMentees.filter((m) => m.status === "active").length}{" "}
                  active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-sky/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tasks Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-brand-orange mr-3" />
              <div>
                <div className="text-2xl font-bold text-brand-navy">
                  {dashboardStats.totalTasksCompleted} /{" "}
                  {dashboardStats.totalTasksCreated}
                </div>
                <p className="text-xs text-gray-500">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-sky/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sessions Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-brand-gold mr-3" />
              <div>
                <div className="text-2xl font-bold text-brand-navy">
                  {dashboardStats.totalSessionsCompleted} /{" "}
                  {dashboardStats.totalSessionsScheduled}
                </div>
                <p className="text-xs text-gray-500">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name, title, or goals..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={goalFilter} onValueChange={setGoalFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All goals</SelectItem>
              {allGoals.map((goal) => (
                <SelectItem key={goal} value={goal}>
                  {goal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-brand-teal hover:bg-brand-navy">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Mentees</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        {/* Enhanced Mentee Cards */}
        <TabsContent value="all" className="mt-6">
          {filteredMentees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees.map((mentee) => (
                <Card
                  key={mentee.id}
                  className={`border-brand-sky/30 hover:shadow-lg transition-shadow ${mentee.status === "inactive" ? "opacity-75" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={mentee.profilePicture || "/images/avatar.png"}
                          alt={mentee.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg text-brand-navy">
                            {mentee.name}
                          </CardTitle>
                          <CardDescription>
                            {mentee.title} at {mentee.company}
                          </CardDescription>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {mentee.primaryGoal}
                          </Badge>
                        </div>
                      </div>
                      {mentee.status === "inactive" && (
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {mentee.bio}
                    </p>

                    {/* Enhanced Progress Section */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Task Progress
                        </span>
                        <span className="text-sm text-gray-500">
                          {mentee.completedTasks}/{mentee.totalTasks} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-brand-teal h-2 rounded-full"
                          style={{ width: `${mentee.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{mentee.progressPercentage}% complete</span>
                        <span>
                          {mentee.completedSessions}/{mentee.totalSessions}{" "}
                          sessions
                        </span>
                      </div>
                    </div>

                    {/* Additional Goals */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentee.goals && mentee.goals.length > 1 ? (
                        mentee.goals.slice(1).map((goal) => (
                          <Badge key={goal} variant="secondary">
                            {goal}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-gray-400">
                          No additional goals
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Joined:</span>{" "}
                      {mentee.joinedDate}
                    </div>
                    {mentee.lastSession && (
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Last session:</span>{" "}
                        {mentee.lastSession}
                      </div>
                    )}
                    {mentee.nextSession && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className="font-medium mr-1">Next session:</span>
                        <Badge variant="outline" className="font-normal">
                          <Clock className="h-3 w-3 mr-1" />
                          {mentee.nextSession}
                        </Badge>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-brand-sky/10 border-brand-teal text-brand-navy hover:bg-brand-sky/20"
                        onClick={() => {
                          router.push(`/dashboard/mentee/${mentee.id}`);
                        }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(`/messages?userId=${mentee.id}`);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <TaskAssignmentModal
                        menteeId={mentee.id}
                        menteeName={mentee.name}
                        onTaskAssigned={refreshDashboard}
                      >
                        <Button size="sm" className="flex items-center gap-2 bg-brand-teal hover:bg-brand-navy">
                          <CheckSquare className="h-4 w-4" />
                          Assign Task
                        </Button>
                      </TaskAssignmentModal>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No mentees found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || goalFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You don't have any mentees yet."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Active Tab */}
        <TabsContent value="active" className="mt-6">
          {filteredMentees.filter((mentee) => mentee.status === "active")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees
                .filter((mentee) => mentee.status === "active")
                .map((mentee) => (
                  <Card key={mentee.id} className="border-brand-sky/30 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={mentee.profilePicture || "/images/avatar.png"}
                            alt={mentee.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg text-brand-navy">
                              {mentee.name}
                            </CardTitle>
                            <CardDescription>
                              {mentee.title} at {mentee.company}
                            </CardDescription>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {mentee.primaryGoal}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {mentee.bio}
                      </p>

                      {/* Enhanced Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Task Progress
                          </span>
                          <span className="text-sm text-gray-500">
                            {mentee.completedTasks}/{mentee.totalTasks} tasks
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-brand-teal h-2 rounded-full"
                            style={{ width: `${mentee.progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{mentee.progressPercentage}% complete</span>
                          <span>
                            {mentee.completedSessions}/{mentee.totalSessions}{" "}
                            sessions
                          </span>
                        </div>
                      </div>

                      {/* Additional Goals */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentee.goals && mentee.goals.length > 1 ? (
                          mentee.goals.slice(1).map((goal) => (
                            <Badge key={goal} variant="secondary">
                              {goal}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            No additional goals
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Joined:</span>{" "}
                        {mentee.joinedDate}
                      </div>
                      {mentee.lastSession && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Last session:</span>{" "}
                          {mentee.lastSession}
                        </div>
                      )}
                      {mentee.nextSession && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium mr-1">
                            Next session:
                          </span>
                          <Badge variant="outline" className="font-normal">
                            <Clock className="h-3 w-3 mr-1" />
                            {mentee.nextSession}
                          </Badge>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-brand-sky/10 border-brand-teal text-brand-navy hover:bg-brand-sky/20"
                          onClick={() => {
                            router.push(`/dashboard/mentee/${mentee.id}`);
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            router.push(`/messages?userId=${mentee.id}`);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <TaskAssignmentModal
                          menteeId={mentee.id}
                          menteeName={mentee.name}
                          onTaskAssigned={refreshDashboard}
                        >
                          <Button size="sm" className="flex items-center gap-2 bg-brand-teal hover:bg-brand-navy">
                            <CheckSquare className="h-4 w-4" />
                            Assign Task
                          </Button>
                        </TaskAssignmentModal>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                No active mentees found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || goalFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You don't have any active mentees."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Inactive Tab */}
        <TabsContent value="inactive" className="mt-6">
          {filteredMentees.filter((mentee) => mentee.status === "inactive")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees
                .filter((mentee) => mentee.status === "inactive")
                .map((mentee) => (
                  <Card key={mentee.id} className="border-brand-sky/30 hover:shadow-lg transition-shadow opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={mentee.profilePicture || "/images/avatar.png"}
                            alt={mentee.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg text-brand-navy">
                              {mentee.name}
                            </CardTitle>
                            <CardDescription>
                              {mentee.title} at {mentee.company}
                            </CardDescription>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {mentee.primaryGoal}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {mentee.bio}
                      </p>

                      {/* Enhanced Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Task Progress
                          </span>
                          <span className="text-sm text-gray-500">
                            {mentee.completedTasks}/{mentee.totalTasks} tasks
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-brand-teal h-2 rounded-full"
                            style={{ width: `${mentee.progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{mentee.progressPercentage}% complete</span>
                          <span>
                            {mentee.completedSessions}/{mentee.totalSessions}{" "}
                            sessions
                          </span>
                        </div>
                      </div>

                      {/* Additional Goals */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentee.goals && mentee.goals.length > 1 ? (
                          mentee.goals.slice(1).map((goal) => (
                            <Badge key={goal} variant="secondary">
                              {goal}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            No additional goals
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Joined:</span>{" "}
                        {mentee.joinedDate}
                      </div>
                      {mentee.lastSession && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Last session:</span>{" "}
                          {mentee.lastSession}
                        </div>
                      )}
                      {mentee.nextSession && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium mr-1">
                            Next session:
                          </span>
                          <Badge variant="outline" className="font-normal">
                            <Clock className="h-3 w-3 mr-1" />
                            {mentee.nextSession}
                          </Badge>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-brand-sky/10 border-brand-teal text-brand-navy hover:bg-brand-sky/20"
                          onClick={() => {
                            router.push(`/dashboard/mentee/${mentee.id}`);
                          }}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            router.push(`/messages?userId=${mentee.id}`);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <TaskAssignmentModal
                          menteeId={mentee.id}
                          menteeName={mentee.name}
                          onTaskAssigned={refreshDashboard}
                        >
                          <Button size="sm" className="flex items-center gap-2 bg-brand-teal hover:bg-brand-navy">
                            <CheckSquare className="h-4 w-4" />
                            Assign Task
                          </Button>
                        </TaskAssignmentModal>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                No inactive mentees found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || goalFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You don't have any inactive mentees."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assigned Tasks Section */}
      <Card className="mb-8 border-brand-sky/30">
        <CardHeader>
          <CardTitle className="text-brand-navy">Assigned Tasks</CardTitle>
          <CardDescription>
            Tasks you've assigned to your mentees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusUpdate={handleTaskStatusUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No tasks assigned yet
              </h3>
              <p className="text-gray-500">
                Start assigning tasks to help guide your mentees' progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Recent Sessions */}
      <Card className="border-brand-sky/30">
        <CardHeader>
          <CardTitle className="text-brand-navy">Recent & Pending Sessions</CardTitle>
          <CardDescription>
            Your 5 most recent sessions and pending requests across all mentees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Image
                      src={session.menteeProfilePicture || "/images/avatar.png"}
                      alt={session.menteeName}
                      width={40}
                      height={40}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{session.menteeName}</h4>
                      <p className="text-sm text-gray-600">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        session.status === "COMPLETED" ? "default" : "outline"
                      }
                      className={
                        session.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : session.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : session.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {session.status === "COMPLETED"
                        ? "Completed"
                        : session.status === "PENDING"
                        ? "Pending"
                        : session.status === "CONFIRMED"
                        ? "Confirmed"
                        : "Cancelled"}
                    </Badge>

                    {/* Quick action buttons for pending sessions */}
                    {session.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSessionStatusUpdate(session.id, "CONFIRMED")
                          }
                          className="text-xs px-2 py-1"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSessionStatusUpdate(session.id, "CANCELLED")
                          }
                          className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {/* Mark as completed for confirmed sessions */}
                    {session.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSessionStatusUpdate(session.id, "COMPLETED")
                        }
                        className="text-xs px-2 py-1 text-green-600 hover:text-green-700"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent sessions found</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewAllSessions}
          >
            View All Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
