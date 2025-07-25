"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Video } from "lucide-react";

interface SessionSchedulingModalProps {
  mentorId: string;
  mentorName: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}

const OFFERING_TYPES = [
  { value: "1-on-1-sessions", label: "1-on-1 Session" },
  { value: "career-guidance", label: "Career Guidance" },
  { value: "skill-development", label: "Skill Development" },
  { value: "interview-preparation", label: "Interview Preparation" },
  { value: "portfolio-review", label: "Portfolio Review" },
  { value: "networking-guidance", label: "Networking Guidance" },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export default function SessionSchedulingModal({
  mentorId,
  mentorName,
  children,
  onSuccess,
}: SessionSchedulingModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [mentorAvailability, setMentorAvailability] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "",
    title: "",
    description: "",
    offeringType: "",
  });

  // Fetch mentor availability when modal opens
  useEffect(() => {
    if (open) {
      fetchMentorAvailability();
    }
  }, [open, mentorId]);

  const fetchMentorAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const response = await fetch(`/api/mentors/${mentorId}/availability`);
      if (response.ok) {
        const availability = await response.json();
        console.log("Fetched availability:", availability); // Debug log
        setMentorAvailability(availability);
      } else if (response.status === 404) {
        console.error("Availability API not found, using fallback");
        // Fallback: create some default availability slots
        const fallbackAvailability = [
          "Monday 9:00 AM",
          "Monday 2:00 PM",
          "Tuesday 10:00 AM",
          "Wednesday 1:00 PM",
          "Thursday 11:00 AM",
          "Friday 3:00 PM",
        ].map((slot) => ({ date: slot, isAvailable: true }));
        setMentorAvailability(fallbackAvailability);
      } else {
        console.error("Failed to fetch availability:", response.status);
      }
    } catch (error) {
      console.error("Error fetching mentor availability:", error);
      // Fallback availability in case of network error
      const fallbackAvailability = [
        { date: "Monday 9:00 AM", isAvailable: true },
        { date: "Tuesday 10:00 AM", isAvailable: true },
        { date: "Wednesday 1:00 PM", isAvailable: true },
      ];
      setMentorAvailability(fallbackAvailability);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Get available dates from mentor's availability
  const getAvailableDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availableDates = new Set();

    console.log("Processing availability:", mentorAvailability);

    mentorAvailability.forEach((slot) => {
      // Handle different availability formats
      let slotDate;

      if (slot.date) {
        // If it's a proper date string or object
        slotDate = new Date(slot.date);
      } else if (typeof slot === "string") {
        // If it's a string like "Monday 9:00 AM", create dates for the next few weeks
        const today = new Date();
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = slot.split(" ")[0];
        const dayIndex = daysOfWeek.indexOf(dayName);

        if (dayIndex !== -1) {
          // Find next occurrence of this day
          const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7;
          slotDate = new Date(today);
          slotDate.setDate(
            today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget)
          );
        }
      }

      if (slotDate && !isNaN(slotDate.getTime()) && slotDate >= today) {
        const isAvailable = slot.isAvailable !== false; // Default to true
        if (isAvailable) {
          const dateStr = slotDate.toISOString().split("T")[0];
          availableDates.add(dateStr);
          console.log("Added date:", dateStr);
        }
      }
    });

    const dates = Array.from(availableDates).sort();
    console.log("Final available dates:", dates);
    return dates;
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (selectedDate: string) => {
    if (!selectedDate) return [];

    console.log("Getting times for date:", selectedDate);
    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const times = mentorAvailability
      .filter((slot) => {
        if (slot.date) {
          // Handle proper date format
          const slotDate = new Date(slot.date).toISOString().split("T")[0];
          return slotDate === selectedDate && slot.isAvailable !== false;
        } else if (typeof slot === "string") {
          // Handle day-based format like "Monday 9:00 AM"
          return slot.startsWith(dayName);
        }
        return false;
      })
      .map((slot) => {
        let timeStr;

        if (slot.date) {
          timeStr = new Date(slot.date).toTimeString().slice(0, 5);
        } else if (typeof slot === "string") {
          // Extract time from "Monday 9:00 AM" format
          const timePart = slot.split(" ").slice(1).join(" ");
          // Convert to 24-hour format
          timeStr = convertTo24Hour(timePart);
        }

        return timeStr ? { value: timeStr, label: timeStr } : null;
      })
      .filter((time): time is { value: string; label: string } => time !== null)
      .sort((a, b) => a.value.localeCompare(b.value));

    console.log("Available times:", times);
    return times;
  };

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get menteeId from localStorage or session
      const menteeId =
        localStorage.getItem("userId") ||
        "3459d90e-8bd8-43f2-9b17-b40b16625668";

      // Combine date and time
      const sessionDateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menteeId,
          mentorId,

          date: sessionDateTime.toISOString(),
          duration: parseInt(formData.duration),
          title: formData.title,
          description: formData.description,
          offeringType: formData.offeringType,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          date: "",
          time: "",
          duration: "",
          title: "",
          description: "",
          offeringType: "",
        });
        onSuccess?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to schedule session");
      }
    } catch (error) {
      console.error("Error scheduling session:", error);
      alert("Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date, time: "" }); // Reset time when date changes
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimesForDate(formData.date);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Session with {mentorName}
          </DialogTitle>
        </DialogHeader>

        {availabilityLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading availability...
            </div>
          </div>
        ) : mentorAvailability.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No availability data found for this mentor.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="offeringType" className="mb-2">
                Session Type
              </Label>
              <Select
                value={formData.offeringType}
                onValueChange={(value) =>
                  setFormData({ ...formData, offeringType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session type..." />
                </SelectTrigger>
                <SelectContent>
                  {OFFERING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="mb-2">
                  Date
                </Label>
                <Select value={formData.date} onValueChange={handleDateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.length > 0 ? (
                      availableDates.map((date) => (
                        <SelectItem key={date as string} value={date as string}>
                          {new Date(date as string).toLocaleDateString()}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-dates" disabled>
                        No available dates
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time" className="mb-2">
                  Time
                </Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, time: value })
                  }
                  disabled={!formData.date}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-times" disabled>
                        {formData.date
                          ? "No available times"
                          : "Select date first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="mb-2">
                Duration
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration..." />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title" className="mb-2">
                Session Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Career guidance session"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What would you like to discuss?"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.date || !formData.time}
                className="flex-1"
              >
                {loading ? "Scheduling..." : "Schedule Session"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
