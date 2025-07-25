"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Calendar, Star, Building } from "lucide-react";
import SessionSchedulingModal from "./SessionSchedulingModal";

interface MentorshipListProps {
  userId: string;
  role: "MENTOR" | "MENTEE";
}

interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  createdAt: string;
  mentor?: {
    id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    company?: string;
    title?: string;
    rating?: number;
  };
  mentee?: {
    id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    company?: string;
    school?: string;
  };
}

export default function MentorshipList({ userId, role }: MentorshipListProps) {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMentorships();
  }, [userId, role]);

  const fetchMentorships = async () => {
    try {
      const response = await fetch(
        `/api/mentorships?userId=${userId}&role=${role}`
      );
      if (response.ok) {
        const data = await response.json();
        setMentorships(data);
      } else {
        throw new Error("Failed to fetch mentorships");
      }
    } catch (err) {
      console.error("Error fetching mentorships:", err);
      setError("Failed to load mentorships");
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const response = await fetch("/api/messages/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: otherUserId,
          currentUserId: userId,
        }),
      });

      if (response.ok) {
        const { conversationId } = await response.json();
        // Navigate to messages page with conversation ID
        window.location.href = `/messages?conversation=${conversationId}`;
      } else {
        alert("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {role === "MENTOR" ? "Your Mentees" : "Your Mentors"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {role === "MENTOR" ? "Your Mentees" : "Your Mentors"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {role === "MENTOR" ? "Your Mentees" : "Your Mentors"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mentorships.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {role === "MENTOR"
                ? "No mentees yet. Accept mentorship requests to get started."
                : "No mentors yet. Send mentorship requests to connect with mentors."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mentorships.map((mentorship) => {
              const person =
                role === "MENTOR" ? mentorship.mentee : mentorship.mentor;
              const otherUserId =
                role === "MENTOR" ? mentorship.menteeId : mentorship.mentorId;

              if (!person) return null;

              return (
                <div
                  key={mentorship.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={person.profilePicture} />
                      <AvatarFallback>
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{person.name}</h4>
                      {role === "MENTOR" ? (
                        <p className="text-sm text-gray-600">
                          {person.company ||
                            ("school" in person ? person.school : null) ||
                            "Student"}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">
                            {"title" in person ? person.title : ""}
                          </p>
                          {person.company && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Building size={12} />
                              {person.company}
                            </div>
                          )}
                        </div>
                      )}
                      {role === "MENTEE" &&
                        "rating" in person &&
                        person.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star
                              size={12}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="text-xs text-gray-600">
                              {person.rating}/5
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartConversation(otherUserId)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    {role === "MENTEE" && (
                      <SessionSchedulingModal
                        mentorId={otherUserId}
                        mentorName={person.name}
                        onSuccess={() => {
                          alert("Session scheduled successfully!");
                        }}
                      >
                        <Button size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </SessionSchedulingModal>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
