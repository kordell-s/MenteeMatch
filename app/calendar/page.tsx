"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar as CalendarIcon, Clock, Video, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  status: string;
  mentorName?: string;
  menteeName?: string;
  description?: string;
  offeringType?: string;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const userRole = session?.user?.role?.toLowerCase() || "mentee";

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const sessionsWithDates = data.map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }));
          setSessions(sessionsWithDates);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchSessions();
    }
  }, [session?.user?.id]);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get sessions for a specific day
  const getSessionsForDay = (day: number) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getDate() === day &&
        sessionDate.getMonth() === currentDate.getMonth() &&
        sessionDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-brand-teal text-white";
      case "pending":
        return "bg-brand-gold text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get selected date sessions
  const selectedDateSessions = selectedDate
    ? sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return (
          sessionDate.getDate() === selectedDate.getDate() &&
          sessionDate.getMonth() === selectedDate.getMonth() &&
          sessionDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-sky border-t-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-20 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Calendar</h1>
        <p className="text-gray-600">
          Manage your mentorship sessions and upcoming meetings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border-2 border-brand-sky/30 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-navy">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 pb-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const daySessions = day ? getSessionsForDay(day) : [];
                const isSelected =
                  selectedDate &&
                  day === selectedDate.getDate() &&
                  currentDate.getMonth() === selectedDate.getMonth() &&
                  currentDate.getFullYear() === selectedDate.getFullYear();

                return (
                  <div
                    key={index}
                    onClick={() =>
                      day &&
                      setSelectedDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        )
                      )
                    }
                    className={`min-h-[80px] p-2 rounded-lg border-2 transition-all cursor-pointer ${
                      !day
                        ? "bg-gray-50 border-transparent cursor-default"
                        : isSelected
                        ? "border-brand-teal bg-brand-teal/10"
                        : isToday(day)
                        ? "border-brand-gold bg-brand-gold/10"
                        : "border-gray-200 hover:border-brand-sky hover:bg-brand-sky/10"
                    }`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday(day)
                              ? "text-brand-gold font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </div>
                        {daySessions.length > 0 && (
                          <div className="space-y-1">
                            {daySessions.slice(0, 2).map((session) => (
                              <div
                                key={session.id}
                                className="text-xs bg-brand-teal text-white px-1 py-0.5 rounded truncate"
                              >
                                {session.time}
                              </div>
                            ))}
                            {daySessions.length > 2 && (
                              <div className="text-xs text-brand-teal font-medium">
                                +{daySessions.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border-2 border-brand-sky/30 p-6">
            <h3 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-teal" />
              {selectedDate
                ? `Sessions on ${selectedDate.toLocaleDateString()}`
                : "Upcoming Sessions"}
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {(selectedDate ? selectedDateSessions : sessions.slice(0, 10)).length > 0 ? (
                (selectedDate ? selectedDateSessions : sessions.slice(0, 10)).map((session) => (
                  <div
                    key={session.id}
                    className="border-2 border-brand-sky/30 rounded-lg p-4 hover:border-brand-teal transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-brand-navy">{session.title}</h4>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-teal" />
                        <span>
                          {session.time} • {session.duration} min
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-teal" />
                        <span>
                          {userRole === "mentor"
                            ? session.menteeName || "Unknown Mentee"
                            : session.mentorName || "Unknown Mentor"}
                        </span>
                      </div>

                      {session.offeringType && (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-brand-teal" />
                          <span className="capitalize">{session.offeringType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {selectedDate
                      ? "No sessions scheduled for this day"
                      : "No upcoming sessions"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
