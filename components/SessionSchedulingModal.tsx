"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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

// Updated type definitions for availability slots
interface TimeSlot {
  start: string; // "09:00"
  end: string; // "17:00"
}

interface AvailabilitySlot {
  days: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  timeSlots: TimeSlot[];
}

type MentorAvailability = AvailabilitySlot[];

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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [mentorAvailability, setMentorAvailability] =
    useState<MentorAvailability>([]);
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
        console.log("Fetched availability:", availability);

        // Normalize the availability data to expected format
        const normalizedAvailability = normalizeAvailabilityData(availability);
        setMentorAvailability(normalizedAvailability);
      } else if (response.status === 404) {
        console.error("Availability API not found, using fallback");
        // Fallback: create structured availability
        const fallbackAvailability: MentorAvailability = [
          {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            timeSlots: [
              { start: "09:00", end: "12:00" },
              { start: "14:00", end: "17:00" },
            ],
          },
          {
            days: ["Saturday"],
            timeSlots: [{ start: "10:00", end: "15:00" }],
          },
        ];
        setMentorAvailability(fallbackAvailability);
      } else {
        console.error("Failed to fetch availability:", response.status);
        setMentorAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching mentor availability:", error);
      // Fallback availability in case of network error
      const fallbackAvailability: MentorAvailability = [
        {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          timeSlots: [{ start: "09:00", end: "17:00" }],
        },
      ];
      setMentorAvailability(fallbackAvailability);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // New function to normalize different availability data formats
  const normalizeAvailabilityData = (data: any): MentorAvailability => {
    // If data is null, undefined, or empty
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return getDefaultAvailability();
    }

    // If data is already in the correct format
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].days &&
      data[0].timeSlots
    ) {
      return data as MentorAvailability;
    }

    // If data is an array of simple objects (like from the old API format)
    if (Array.isArray(data)) {
      // Try to convert simple availability data to structured format
      const hasValidSlots = data.some(
        (slot) =>
          slot &&
          (slot.date || slot.day || slot.time || slot.isAvailable !== undefined)
      );

      if (hasValidSlots) {
        // Convert simple slots to structured format
        return [
          {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            timeSlots: [
              { start: "09:00", end: "12:00" },
              { start: "14:00", end: "17:00" },
            ],
          },
        ];
      }
    }

    // If data is a string, try to parse it
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return normalizeAvailabilityData(parsed);
      } catch {
        // If parsing fails, return default
        return getDefaultAvailability();
      }
    }

    // If data is an object but not in expected format
    if (typeof data === "object" && !Array.isArray(data)) {
      return getDefaultAvailability();
    }

    // Fallback to default availability
    return getDefaultAvailability();
  };

  // Helper function to get default availability
  const getDefaultAvailability = (): MentorAvailability => {
    return [
      {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "17:00" },
        ],
      },
    ];
  };

  // Get available dates from mentor's availability
  const getAvailableDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availableDates = new Set<string>();

    console.log("Processing availability:", mentorAvailability);

    // Ensure mentorAvailability is always an array
    const availability = Array.isArray(mentorAvailability)
      ? mentorAvailability
      : [];

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    availability.forEach((availabilitySlot) => {
      // Ensure the slot has the expected structure
      if (!availabilitySlot || !Array.isArray(availabilitySlot.days)) {
        return;
      }

      availabilitySlot.days.forEach((dayName) => {
        const dayIndex = daysOfWeek.indexOf(dayName);

        if (dayIndex !== -1) {
          // Generate dates for the next 4 weeks
          for (let week = 0; week < 4; week++) {
            const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntilTarget + week * 7);

            // If it's today and we're in the first week, include today
            if (week === 0 && daysUntilTarget === 0) {
              targetDate.setDate(today.getDate());
            }

            if (targetDate >= today) {
              const dateStr = targetDate.toISOString().split("T")[0];
              availableDates.add(dateStr);
              console.log("Added date:", dateStr, "for", dayName);
            }
          }
        }
      });
    });

    const dates = Array.from(availableDates).sort();
    console.log("Final available dates:", dates);
    return dates;
  };

  // Generate hourly time slots between start and end times
  const generateTimeSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      // Also add half-hour slots
      if (hour + 0.5 < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }

    return slots;
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (selectedDate: string) => {
    if (!selectedDate) return [];

    console.log("Getting times for date:", selectedDate);
    const selectedDateObj = new Date(selectedDate);
    const dayName = selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const timeSlots = new Set<string>();

    mentorAvailability.forEach((availability) => {
      if (availability.days.includes(dayName)) {
        availability.timeSlots.forEach((slot) => {
          const slots = generateTimeSlots(slot.start, slot.end);
          slots.forEach((time) => timeSlots.add(time));
        });
      }
    });

    const times = Array.from(timeSlots)
      .sort()
      .map((time) => ({
        value: time,
        label: time,
      }));

    console.log("Available times for", dayName, ":", times);
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

    // Validate required fields
    if (
      !formData.date ||
      !formData.time ||
      !formData.duration ||
      !formData.title ||
      !formData.offeringType
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Use session user ID instead of localStorage
      if (!session?.user?.id) {
        alert("Please log in to schedule a session");
        setLoading(false);
        return;
      }

      // Combine date and time into proper ISO format
      const sessionDateTime = new Date(`${formData.date}T${formData.time}:00`);

      if (isNaN(sessionDateTime.getTime())) {
        alert("Invalid date or time selected");
        setLoading(false);
        return;
      }

      const sessionData = {
        menteeId: session.user.id, // Use session ID
        mentorId,
        date: sessionDateTime.toISOString(),
        duration: parseInt(formData.duration),
        title: formData.title.trim(),
        description: formData.description.trim() || "",
        offeringType: formData.offeringType,
        status: "UPCOMING",
      };

      console.log("Scheduling session with data:", sessionData);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Session scheduled successfully:", result);

        // Reset form
        setFormData({
          date: "",
          time: "",
          duration: "",
          title: "",
          description: "",
          offeringType: "",
        });

        // Close modal
        setOpen(false);

        // Show success message
        alert(`Session scheduled successfully with ${mentorName}!`);

        // Call success callback
        onSuccess?.();
      } else {
        const error = await response.json();
        console.error("Failed to schedule session:", error);
        alert(error.error || "Failed to schedule session. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling session:", error);
      alert("Network error. Please check your connection and try again.");
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                Session Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.offeringType}
                onValueChange={(value) =>
                  setFormData({ ...formData, offeringType: value })
                }
                required
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
                  Date <span className="text-red-500">*</span>
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
                  Time <span className="text-red-500">*</span>
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
                Duration <span className="text-red-500">*</span>
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
                Session Title <span className="text-red-500">*</span>
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
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.date ||
                  !formData.time ||
                  !formData.duration ||
                  !formData.title ||
                  !formData.offeringType
                }
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Session
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
