"use client";

import { useState, useEffect } from "react";
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

// Define TypeScript interface for mentorship request
interface MentorshipRequest {
  id: number;
  mentee: {
    name: string;
    avatar?: string;
    title: string;
    email?: string;
  };
  sessionType: string;
  message: string;
  date: string;
  status: "pending" | "accepted" | "declined";
  availability: string[];
  scheduledFor?: string;
  createdAt?: string;
  preferredDuration?: string;
  urgency?: "low" | "medium" | "high";
}

export default function RequestsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [mentorshipRequests, setMentorshipRequests] = useState<
    MentorshipRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mentorship requests for the current mentor
  const fetchMentorshipRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      const response = await fetch("/api/mentor/requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      // Handle 404 - API endpoint doesn't exist yet
      if (response.status === 404) {
        setMentorshipRequests([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch mentorship requests");
      }

      const data = await response.json();
      setMentorshipRequests(data.requests || []);
    } catch (err) {
      // If it's a network error or the API doesn't exist, just show empty state
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setMentorshipRequests([]);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching requests"
        );
      }
      console.error("Error fetching mentorship requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load requests when component mounts
  useEffect(() => {
    fetchMentorshipRequests();
  }, []);

  // Handle request actions
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/mentor/requests/${requestId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh the requests list
        fetchMentorshipRequests();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `/api/mentor/requests/${requestId}/decline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Refresh the requests list
        fetchMentorshipRequests();
      }
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

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

  // Show loading state
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mentorship Requests</h1>
          <p className="text-gray-600">
            Manage and respond to mentorship requests from mentees
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mentorship requests...</p>
        </div>
      </div>
    );
  }

  // Only show error state for actual errors, not empty data
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Mentorship Requests</h1>
          <p className="text-gray-600">
            Manage and respond to mentorship requests from mentees
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error loading requests</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchMentorshipRequests}>Try Again</Button>
        </div>
      </div>
    );
  }

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
                            <Button
                              className="sm:w-auto"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              Accept Request
                            </Button>
                            <Button variant="outline" className="sm:w-auto">
                              Suggest Alternative Time
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-500 border-red-200 sm:w-auto"
                              onClick={() => handleDeclineRequest(request.id)}
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
                    {mentorshipRequests.length === 0
                      ? "No mentorship requests yet"
                      : "No requests found"}
                  </h3>
                  <p className="text-gray-500">
                    {mentorshipRequests.length === 0
                      ? "You don't have any mentorship requests at the moment. Mentees will be able to send you requests once your profile is set up."
                      : searchQuery || sessionTypeFilter !== "all"
                      ? "Try adjusting your filters to see more requests"
                      : "No requests match your current filters"}
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
