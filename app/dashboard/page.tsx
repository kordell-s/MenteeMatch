"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Search,
  Star,
} from "lucide-react";

// Mock data for dashboard
const mentorStats = {
  totalMentees: 12,
  activeRequests: 5,
  completedSessions: 28,
  upcomingSessions: 3,
  totalEarnings: 1240,
  rating: 4.8,
};

const menteeStats = {
  totalMentors: 4,
  activeSessions: 2,
  completedSessions: 8,
  upcomingSessions: 1,
};

const upcomingSessions = [
  {
    id: 1,
    mentee: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
    },
    mentor: {
      name: "David Chen",
      avatar: "/placeholder.svg",
    },
    sessionType: "Career Guidance",
    date: "Tomorrow",
    time: "10:00 AM - 11:00 AM",
    status: "confirmed",
  },
  {
    id: 2,
    mentee: {
      name: "James Rodriguez",
      avatar: "/placeholder.svg",
    },
    mentor: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
    },
    sessionType: "Resume Review",
    date: "May 15, 2023",
    time: "2:00 PM - 3:00 PM",
    status: "confirmed",
  },
  {
    id: 3,
    mentee: {
      name: "Olivia Martinez",
      avatar: "/placeholder.svg",
    },
    mentor: {
      name: "Michael Brown",
      avatar: "/placeholder.svg",
    },
    sessionType: "Mock Interview",
    date: "May 18, 2023",
    time: "11:00 AM - 12:30 PM",
    status: "pending",
  },
];

const recentRequests = [
  {
    id: 1,
    mentee: {
      name: "Sophia Lee",
      avatar: "/placeholder.svg",
    },
    sessionType: "Career Transition",
    message:
      "I need guidance on transitioning from marketing to product management.",
    date: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    mentee: {
      name: "Daniel Kim",
      avatar: "/placeholder.svg",
    },
    sessionType: "Resume Review",
    message: "Could you review my resume for a senior developer position?",
    date: "1 day ago",
    status: "accepted",
  },
  {
    id: 3,
    mentee: {
      name: "Aisha Patel",
      avatar: "/placeholder.svg",
    },
    sessionType: "Mock Interview",
    message: "I have an interview next week and would like to practice.",
    date: "2 days ago",
    status: "declined",
  },
];

// Popular mentor categories for mentees
const mentorCategories = [
  {
    id: 1,
    name: "Career Development",
    count: 45,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Technical Skills",
    count: 38,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Leadership",
    count: 29,
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Resume & Interview",
    count: 52,
    icon: "/placeholder.svg?height=40&width=40",
  },
];

// Recommended mentors for mentees
const recommendedMentors = [
  {
    id: 1,
    name: "Jennifer Lee",
    title: "Senior UX Designer",
    company: "Airbnb",
    avatar: "/placeholder.svg",
    rating: 4.9,
    specialties: ["Portfolio Review", "Career Transition", "UX Strategy"],
    price: 85,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "Engineering Manager",
    company: "Google",
    avatar: "/placeholder.svg",
    rating: 4.8,
    specialties: ["Technical Leadership", "System Design", "Career Growth"],
    price: 120,
  },
  {
    id: 3,
    name: "Priya Sharma",
    title: "Product Director",
    company: "Spotify",
    avatar: "/placeholder.svg",
    rating: 5.0,
    specialties: ["Product Strategy", "User Research", "Roadmapping"],
    price: 100,
  },
];

export default function DashboardPage() {
  const [userRole, setUserRole] = useState("mentor"); // Default to mentor

  // Toggle role for demonstration
  const toggleRole = () => {
    setUserRole(userRole === "mentor" ? "mentee" : "mentor");
  };

  return (
    <div>
      {/* Mentor Dashboard */}
      {userRole === "mentor" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorStats.activeRequests}
                    </div>
                    <p className="text-xs text-gray-500">+2 this week</p>
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
                  <Calendar className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorStats.upcomingSessions}
                    </div>
                    <p className="text-xs text-gray-500">
                      Next: Tomorrow, 10:00 AM
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
                  <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {mentorStats.completedSessions}
                    </div>
                    <p className="text-xs text-gray-500">+5 this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${mentorStats.totalEarnings}
                    </div>
                    <p className="text-xs text-gray-500">+$320 this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={request.mentee.avatar || "/placeholder.svg"}
                        alt={request.mentee.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{request.mentee.name}</h4>
                          <span className="text-xs text-gray-500">
                            {request.date}
                          </span>
                        </div>
                        <Badge className="mt-1 mb-2">
                          {request.sessionType}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {request.message}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center">
                        {request.status === "pending" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200"
                            >
                              Decline
                            </Button>
                            <Button size="sm">Accept</Button>
                          </div>
                        ) : request.status === "accepted" ? (
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
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/requests">
                  <Button variant="outline" className="w-full">
                    View All Requests
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{session.sessionType}</Badge>
                        <span className="text-xs font-medium text-gray-500">
                          {session.date}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <Image
                          src={session.mentee.avatar || "/placeholder.svg"}
                          alt={session.mentee.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="ml-2 text-sm">
                          {session.mentee.name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                    </div>
                  ))}
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
      {userRole === "mentee" && (
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
                      {menteeStats.totalMentors}
                    </div>
                    <p className="text-xs text-gray-500">Across 3 categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {menteeStats.activeSessions}
                    </div>
                    <p className="text-xs text-gray-500">
                      Next: Tomorrow, 10:00 AM
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
                  <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {menteeStats.completedSessions}
                    </div>
                    <p className="text-xs text-gray-500">+2 this month</p>
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
                      {menteeStats.upcomingSessions}
                    </div>
                    <p className="text-xs text-gray-500">Resume Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Find Mentors Section - New prominent section for mentees */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Your Perfect Mentor</CardTitle>
              <CardDescription>
                Discover mentors who can help you achieve your goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      What are you looking for help with?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Browse our community of experienced mentors across various
                      fields and specialties.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {mentorCategories.map((category) => (
                        <Link
                          href={`/browse?category=${category.name}`}
                          key={category.id}
                        >
                          <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <Image
                              src={category.icon || "/placeholder.svg"}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="rounded-md mr-3"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {category.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {category.count} mentors
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link href="/browse">
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Mentors
                    </Button>
                  </Link>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Recommended for you
                  </h3>
                  <div className="space-y-4">
                    {recommendedMentors.map((mentor) => (
                      <Link href={`/mentor/${mentor.id}`} key={mentor.id}>
                        <div className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Image
                            src={mentor.avatar || "/placeholder.svg"}
                            alt={mentor.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{mentor.name}</h4>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm ml-1">
                                  {mentor.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {mentor.title} at {mentor.company}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mentor.specialties
                                .slice(0, 2)
                                .map((specialty, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                              {mentor.specialties.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentor.specialties.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>My Mentors</CardTitle>
                <CardDescription>Connect with your mentors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      name: "David Chen",
                      title: "Senior Product Manager",
                      company: "Google",
                      avatar: "/placeholder.svg",
                      expertise: ["Career Guidance", "Product Management"],
                      lastSession: "2 days ago",
                    },
                    {
                      id: 2,
                      name: "Sarah Johnson",
                      title: "UX Design Lead",
                      company: "Adobe",
                      avatar: "/placeholder.svg",
                      expertise: ["Resume Review", "Portfolio Feedback"],
                      lastSession: "1 week ago",
                    },
                    {
                      id: 3,
                      name: "Michael Brown",
                      title: "Engineering Manager",
                      company: "Microsoft",
                      avatar: "/placeholder.svg",
                      expertise: ["Mock Interview", "Technical Skills"],
                      lastSession: "2 weeks ago",
                    },
                  ].map((mentor) => (
                    <div
                      key={mentor.id}
                      className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={mentor.avatar || "/placeholder.svg"}
                        alt={mentor.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{mentor.name}</h4>
                          <span className="text-xs text-gray-500">
                            Last session: {mentor.lastSession}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {mentor.title} at {mentor.company}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mentor.expertise.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/mentors">
                  <Button variant="outline" className="w-full">
                    View All My Mentors
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{session.sessionType}</Badge>
                        <span className="text-xs font-medium text-gray-500">
                          {session.date}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <Image
                          src={session.mentor.avatar || "/placeholder.svg"}
                          alt={session.mentor.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="ml-2 text-sm">
                          {session.mentor.name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
