"use client";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import type { DashboardData } from "@/app/types/dashboardData";

export default function MyMenteesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");

  const mentorId = "23d6c35a-3c3f-4d7f-a6fc-95ba7da4c216";
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const myMentees = dashboardData?.confirmedMentees || [];

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`/api/dashboard/mentor?id=${mentorId}`);
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    fetchDashboard();
  }, []);

  // Get unique goals for filter dropdown
  const allGoals = Array.from(
    new Set(myMentees.flatMap((mentee) => mentee.goals).filter(Boolean))
  );

  // Filter mentees based on search query, active tab, and goal filter
  const filteredMentees = myMentees.filter((mentee) => {
    const goalsArray = mentee.goals || [];
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
        <h1 className="text-2xl font-bold mb-2">My Mentees</h1>
        <p className="text-gray-600">
          Manage your mentees and track their progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <div className="text-2xl font-bold">{myMentees.length}</div>
                <p className="text-xs text-gray-500">
                  {myMentees.filter((m) => m.status === "active").length} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sessions Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {myMentees.reduce(
                    (total, mentee) => total + mentee.sessionsCompleted,
                    0
                  )}
                </div>
                <p className="text-xs text-gray-500">+5 this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    myMentees.reduce(
                      (sum, mentee) => sum + mentee.progress,
                      0
                    ) / myMentees.length
                  )}
                  %
                </div>
                <p className="text-xs text-gray-500">Across all mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

          <Button>
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

        <TabsContent value="all" className="mt-6">
          {filteredMentees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees.map((mentee) => (
                <Card
                  key={mentee.id}
                  className={mentee.status === "inactive" ? "opacity-75" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={"/images/avatar.png"}
                          alt={mentee.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {mentee.name}
                          </CardTitle>
                          <CardDescription>
                            {mentee.title} at {mentee.company}
                          </CardDescription>
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

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-500">
                          {mentee.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${mentee.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentee.goals.map((goal) => (
                        <Badge key={goal} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Joined:</span>{" "}
                      {mentee.joinedDate}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Sessions:</span>{" "}
                      {mentee.sessionsCompleted} completed
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
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </CardFooter>
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

        <TabsContent value="active" className="mt-6">
          {/* Similar content as "all" tab but filtered for active mentees */}
          {filteredMentees.filter((mentee) => mentee.status === "active")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees
                .filter((mentee) => mentee.status === "active")
                .map((mentee) => (
                  <Card key={mentee.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={"/images/avatar.png"}
                            alt={mentee.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">
                              {mentee.name}
                            </CardTitle>
                            <CardDescription>
                              {mentee.title} at {mentee.company}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {mentee.bio}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-500">
                            {mentee.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${mentee.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentee.goals.map((goal) => (
                          <Badge key={goal} variant="secondary">
                            {goal}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Joined:</span>{" "}
                        {mentee.joinedDate}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Sessions:</span>{" "}
                        {mentee.sessionsCompleted} completed
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
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </CardFooter>
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

        <TabsContent value="inactive" className="mt-6">
          {/* Similar content as "all" tab but filtered for inactive mentees */}
          {filteredMentees.filter((mentee) => mentee.status === "inactive")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees
                .filter((mentee) => mentee.status === "inactive")
                .map((mentee) => (
                  <Card key={mentee.id} className="opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={mentee.avatar || "/placeholder.svg"}
                            alt={mentee.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">
                              {mentee.name}
                            </CardTitle>
                            <CardDescription>
                              {mentee.title} at {mentee.company}
                            </CardDescription>
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

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-500">
                            {mentee.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${mentee.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentee.goals.map((goal) => (
                          <Badge key={goal} variant="secondary">
                            {goal}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Joined:</span>{" "}
                        {mentee.joinedDate}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Sessions:</span>{" "}
                        {mentee.sessionsCompleted} completed
                      </div>
                      {mentee.lastSession && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Last session:</span>{" "}
                          {mentee.lastSession}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button className="flex-1">Reactivate</Button>
                    </CardFooter>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Review your recent mentoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start">
                  <Image
                    src={"/images/avatar.png"}
                    alt={session.mentee.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{session.mentee.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < session.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Badge variant="outline" className="mr-2">
                        {session.sessionType}
                      </Badge>
                      <span>
                        {session.date}, {session.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{session.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
