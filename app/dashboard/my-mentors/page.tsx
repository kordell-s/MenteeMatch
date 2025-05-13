"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function MenteeDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<MenteeDashboardData | null>(null);

  const userId = "3459d90e-8bd8-43f2-9b17-b40b16625668"; // Replace this with actual logged-in user ID logic

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`/api/dashboard/mentee?id=${userId}`);
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchDashboard();
  }, []);

  if (!dashboardData) return <div>Loading...</div>;

  const { mentorInfo, tasks, upcomingSessions, completedSessions, progress } =
    dashboardData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Mentor</h1>
        <p className="text-gray-600">Your current mentor and progress</p>
      </div>

      {mentorInfo ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex space-x-4">
                <Image
                  src={mentorInfo.profilePicture || "/images/avatar.png"}
                  alt={mentorInfo.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-lg">{mentorInfo.name}</CardTitle>
                  <CardDescription>
                    {mentorInfo.title} at {mentorInfo.company}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm ml-1">{mentorInfo.rating}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">{mentorInfo.bio}</p>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Progress:</span> {progress}%
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="text-gray-500">
          You don't have a mentor assigned yet.
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
                  className="flex items-start justify-between border rounded-lg p-4"
                >
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-4 w-4 mr-1" />
                    {session.status}
                  </Badge>
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
                  className="border p-3 rounded-md text-sm text-gray-700"
                >
                  {session.title} -{" "}
                  {new Date(session.date).toLocaleDateString()}
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
                  <span>{task.title}</span>
                  <Badge
                    variant={
                      task.status === "COMPLETED" ? "default" : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
