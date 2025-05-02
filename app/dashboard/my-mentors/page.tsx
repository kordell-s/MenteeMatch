"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Calendar,
  MessageSquare,
  Search,
  Star,
  Clock,
  Users,
} from "lucide-react";

// Mock data for mentors
const myMentors = [
  {
    id: 1,
    name: "David Chen",
    title: "Senior Product Manager",
    company: "Google",
    avatar: "/placeholder.svg",
    expertise: ["Career Guidance", "Product Management", "Leadership"],
    lastSession: "2 days ago",
    nextSession: "May 15, 2023, 10:00 AM",
    bio: "Experienced product leader with 10+ years in tech. I help aspiring PMs break into the field and level up their careers.",
    rating: 4.9,
    reviews: 48,
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    title: "UX Design Lead",
    company: "Adobe",
    avatar: "/placeholder.svg",
    expertise: ["Resume Review", "Portfolio Feedback", "Design Systems"],
    lastSession: "1 week ago",
    nextSession: null,
    bio: "Design leader specializing in product design and design systems. I help designers create impactful, scalable design solutions.",
    rating: 5.0,
    reviews: 39,
    status: "active",
  },
  {
    id: 3,
    name: "Michael Brown",
    title: "Engineering Manager",
    company: "Microsoft",
    avatar: "/placeholder.svg",
    expertise: ["Mock Interview", "Technical Skills", "Career Development"],
    lastSession: "2 weeks ago",
    nextSession: "May 18, 2023, 2:00 PM",
    bio: "Engineering leader with experience at top tech companies. I help engineers prepare for technical interviews and advance their careers.",
    rating: 4.8,
    reviews: 36,
    status: "active",
  },
  {
    id: 4,
    name: "Jennifer Lee",
    title: "Marketing Director",
    company: "Spotify",
    avatar: "/placeholder.svg",
    expertise: ["Digital Marketing", "Brand Strategy", "Content Marketing"],
    lastSession: "1 month ago",
    nextSession: null,
    bio: "Marketing leader specializing in growth and brand strategy. I help marketers develop effective campaigns and advance their careers.",
    rating: 4.7,
    reviews: 42,
    status: "inactive",
  },
];

// Past sessions data
const pastSessions = [
  {
    id: 1,
    mentor: {
      id: 1,
      name: "David Chen",
      avatar: "/placeholder.svg",
    },
    date: "May 2, 2023",
    time: "10:00 AM - 11:00 AM",
    sessionType: "Career Guidance",
    notes:
      "Discussed career transition plan and identified key skills to develop.",
    rating: 5,
  },
  {
    id: 2,
    mentor: {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
    },
    date: "April 25, 2023",
    time: "2:00 PM - 3:00 PM",
    sessionType: "Portfolio Review",
    notes:
      "Reviewed portfolio and received feedback on improving case studies.",
    rating: 5,
  },
  {
    id: 3,
    mentor: {
      id: 3,
      name: "Michael Brown",
      avatar: "/placeholder.svg",
    },
    date: "April 18, 2023",
    time: "11:00 AM - 12:00 PM",
    sessionType: "Mock Interview",
    notes:
      "Practiced technical interview questions and received feedback on communication.",
    rating: 4,
  },
  {
    id: 4,
    mentor: {
      id: 4,
      name: "Jennifer Lee",
      avatar: "/placeholder.svg",
    },
    date: "April 5, 2023",
    time: "3:00 PM - 4:00 PM",
    sessionType: "Marketing Strategy",
    notes:
      "Discussed digital marketing trends and career opportunities in the field.",
    rating: 5,
  },
];

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter mentors based on search query and active tab
  const filteredMentors = myMentors.filter((mentor) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = mentor.name.toLowerCase().includes(query);
      const titleMatch = mentor.title.toLowerCase().includes(query);
      const expertiseMatch = mentor.expertise.some((skill) =>
        skill.toLowerCase().includes(query)
      );

      if (!(nameMatch || titleMatch || expertiseMatch)) {
        return false;
      }
    }

    // Filter by tab
    if (activeTab === "active" && mentor.status !== "active") {
      return false;
    }

    if (activeTab === "inactive" && mentor.status !== "inactive") {
      return false;
    }

    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Mentors</h1>
        <p className="text-gray-600">
          Connect with your mentors and manage your mentorship relationships
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search by name, title, or expertise..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <Link href="/browse">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find New Mentors
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Mentors</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className={mentor.status === "inactive" ? "opacity-75" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={"/images/avatar.png"}
                          alt={mentor.name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {mentor.name}
                          </CardTitle>
                          <CardDescription>
                            {mentor.title} at {mentor.company}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm ml-1">{mentor.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {mentor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {mentor.status === "active" ? (
                      <>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Last session:</span>{" "}
                          {mentor.lastSession}
                        </div>
                        {mentor.nextSession && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <span className="font-medium mr-1">
                              Next session:
                            </span>
                            <Badge variant="outline" className="font-normal">
                              <Clock className="h-3 w-3 mr-1" />
                              {mentor.nextSession}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Inactive
                      </Badge>
                    )}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No mentors found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "You don't have any mentors yet. Find a mentor to get started!"}
              </p>
              <Link href="/browse">
                <Button>Find Mentors</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {filteredMentors.filter((mentor) => mentor.status === "active")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors
                .filter((mentor) => mentor.status === "active")
                .map((mentor) => (
                  <Card
                    key={mentor.id}
                    className={mentor.status === "inactive" ? "opacity-75" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={"/images/avatar.png"}
                            alt={mentor.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">
                              {mentor.name}
                            </CardTitle>
                            <CardDescription>
                              {mentor.title} at {mentor.company}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm ml-1">{mentor.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {mentor.bio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {mentor.status === "active" ? (
                        <>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Last session:</span>{" "}
                            {mentor.lastSession}
                          </div>
                          {mentor.nextSession && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <span className="font-medium mr-1">
                                Next session:
                              </span>
                              <Badge variant="outline" className="font-normal">
                                <Clock className="h-3 w-3 mr-1" />
                                {mentor.nextSession}
                              </Badge>
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      )}
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
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                No active mentors found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "You don't have any active mentors yet."}
              </p>
              <Link href="/browse">
                <Button>Find Mentors</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          {filteredMentors.filter((mentor) => mentor.status === "inactive")
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors
                .filter((mentor) => mentor.status === "inactive")
                .map((mentor) => (
                  <Card
                    key={mentor.id}
                    className={mentor.status === "inactive" ? "opacity-75" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={"/images/avatar.png"}
                            alt={mentor.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">
                              {mentor.name}
                            </CardTitle>
                            <CardDescription>
                              {mentor.title} at {mentor.company}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm ml-1">{mentor.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {mentor.bio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {mentor.status === "active" ? (
                        <>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Last session:</span>{" "}
                            {mentor.lastSession}
                          </div>
                          {mentor.nextSession && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <span className="font-medium mr-1">
                                Next session:
                              </span>
                              <Badge variant="outline" className="font-normal">
                                <Clock className="h-3 w-3 mr-1" />
                                {mentor.nextSession}
                              </Badge>
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      )}
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
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                No inactive mentors found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "You don't have any inactive mentors."}
              </p>
              <Link href="/browse">
                <Button>Find Mentors</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>
            Review your previous mentoring sessions
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
                    src={session.mentor.avatar || "/placeholder.svg"}
                    alt={session.mentor.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{session.mentor.name}</h4>
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
            View All Past Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
