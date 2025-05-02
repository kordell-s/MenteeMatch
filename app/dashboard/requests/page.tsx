"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Search, Calendar, MessageSquare, Inbox } from "lucide-react";

// Mock data for mentorship requests
const mentorshipRequests = [
  {
    id: 1,
    mentee: {
      name: "Sophia Lee",
      avatar: "/placeholder.svg",
      title: "Marketing Specialist",
    },
    sessionType: "Career Transition",
    message:
      "I need guidance on transitioning from marketing to product management. I have 5 years of experience in digital marketing and I'm interested in leveraging my analytical skills and user insights in a product role. Could you help me create a transition plan and identify skills I need to develop?",
    date: "2 hours ago",
    status: "pending",
    availability: ["Monday evenings", "Wednesday afternoons", "Weekends"],
  },
  {
    id: 2,
    mentee: {
      name: "Daniel Kim",
      avatar: "/placeholder.svg",
      title: "Frontend Developer",
    },
    sessionType: "Resume Review",
    message:
      "Could you review my resume for a senior developer position? I've been working as a frontend developer for 4 years and I'm looking to take the next step in my career. I've attached my current resume for your review.",
    date: "1 day ago",
    status: "accepted",
    availability: ["Tuesday evenings", "Thursday mornings"],
    scheduledFor: "May 15, 2023, 6:00 PM",
  },
  {
    id: 3,
    mentee: {
      name: "Aisha Patel",
      avatar: "/placeholder.svg",
      title: "Product Designer",
    },
    sessionType: "Mock Interview",
    message:
      "I have an interview next week for a senior product designer role at a fintech company. I'd like to practice my portfolio presentation and answering design challenge questions. I'm particularly nervous about explaining my design process.",
    date: "2 days ago",
    status: "declined",
    availability: ["Friday afternoons", "Weekends"],
  },
  {
    id: 4,
    mentee: {
      name: "James Wilson",
      avatar: "/placeholder.svg",
      title: "Data Analyst",
    },
    sessionType: "Career Guidance",
    message:
      "I'm considering specializing in either data science or business intelligence. I'd appreciate your insights on the career prospects, required skills, and day-to-day responsibilities of both paths to help me make an informed decision.",
    date: "3 days ago",
    status: "pending",
    availability: ["Monday mornings", "Wednesday evenings"],
  },
  {
    id: 5,
    mentee: {
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg",
      title: "Recent Graduate",
    },
    sessionType: "Portfolio Review",
    message:
      "I just graduated with a degree in UX design and I'd love your feedback on my portfolio before I start applying for jobs. I want to make sure my projects showcase my skills effectively and stand out to potential employers.",
    date: "4 days ago",
    status: "accepted",
    availability: ["Weekday evenings", "Weekends"],
    scheduledFor: "May 18, 2023, 7:00 PM",
  },
];

export default function RequestsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  

  // Filter requests based on status and search query
  const filteredRequests = mentorshipRequests.filter((request) => {
    // Filter by status
    if (filter !== "all" && request.status !== filter) {
      return false;
    }

    // Filter by session type
    if (
      sessionTypeFilter !== "all" &&
      request.sessionType !== sessionTypeFilter
    ) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.mentee.name.toLowerCase().includes(query) ||
        request.sessionType.toLowerCase().includes(query) ||
        request.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get unique session types for filter dropdown
  const sessionTypes = Array.from(
    new Set(mentorshipRequests.map((request) => request.sessionType))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mentorship Requests</h1>
        <p className="text-gray-600">
          Manage and respond to mentorship requests from mentees
        </p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilter("all")}>
                All Requests
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setFilter("pending")}>
                Pending
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {
                    mentorshipRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                onClick={() => setFilter("accepted")}
              >
                Accepted
              </TabsTrigger>
              <TabsTrigger
                value="declined"
                onClick={() => setFilter("declined")}
              >
                Declined
              </TabsTrigger>
            </TabsList>

            <div className="flex mt-4 sm:mt-0 space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search requests..."
                  className="pl-9 w-full sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={sessionTypeFilter}
                onValueChange={setSessionTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All session types</SelectItem>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="p-0">
            <div className="divide-y">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start">
                      <Image
                        src={request.mentee.avatar || "/placeholder.svg"}
                        alt={request.mentee.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg">
                              {request.mentee.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {request.mentee.title}
                            </p>
                          </div>
                          <div className="flex items-center mt-2 sm:mt-0">
                            <span className="text-sm text-gray-500 mr-3">
                              {request.date}
                            </span>
                            {request.status === "pending" ? (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                Pending
                              </Badge>
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

                        <div className="mb-4">
                          <Badge variant="outline" className="mb-2">
                            {request.sessionType}
                          </Badge>
                          <p className="text-gray-700">{request.message}</p>
                        </div>

                        {request.availability && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                              Availability:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {request.availability.map((time, index) => (
                                <Badge key={index} variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.scheduledFor && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                              Scheduled for:
                            </p>
                            <Badge variant="outline" className="mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {request.scheduledFor}
                            </Badge>
                          </div>
                        )}

                        {request.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <Button className="sm:w-auto">
                              Accept Request
                            </Button>
                            <Button variant="outline" className="sm:w-auto">
                              Suggest Alternative Time
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-500 border-red-200 sm:w-auto"
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {request.status === "accepted" && (
                          <div className="flex gap-3 mt-4">
                            <Button>
                              <Calendar className="h-4 w-4 mr-2" />
                              View in Calendar
                            </Button>
                            <Button variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message Mentee
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Inbox className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    No requests found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery || sessionTypeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "You don't have any mentorship requests at the moment"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="p-0">
            {/* Same content structure as "all" tab but filtered for pending */}
          </TabsContent>

          <TabsContent value="accepted" className="p-0">
            {/* Same content structure as "all" tab but filtered for accepted */}
          </TabsContent>

          <TabsContent value="declined" className="p-0">
            {/* Same content structure as "all" tab but filtered for declined */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
