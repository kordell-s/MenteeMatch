"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MentorshipRequestFormProps {
  mentorId: string;
  mentorName: string;
  onSuccess?: () => void;
}

const MENTORSHIP_OFFERINGS = [
  { value: "1-on-1-sessions", label: "1-on-1 Sessions" },
  { value: "career-guidance", label: "Career Guidance" },
  { value: "skill-development", label: "Skill Development" },
  { value: "interview-preparation", label: "Interview Preparation" },
  { value: "portfolio-review", label: "Portfolio Review" },
  { value: "networking-guidance", label: "Networking Guidance" },
];

export default function MentorshipRequestForm({
  mentorId,
  mentorName,
  onSuccess,
}: MentorshipRequestFormProps) {
  const [offeringType, setOfferingType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!offeringType) {
      setError("Please select a mentorship offering");
      return false;
    }
    if (!message.trim()) {
      setError("Please write a message expressing your interest");
      return false;
    }
    if (message.trim().length < 20) {
      setError("Please write a more detailed message (at least 20 characters)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get menteeId from localStorage or session
      const menteeId =
        localStorage.getItem("userId") ||
        "3459d90e-8bd8-43f2-9b17-b40b16625668";

      const response = await fetch("/api/mentorship-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menteeId,
          mentorId,
          offeringType,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setOfferingType("");
        setMessage("");
        setTimeout(() => {
          setStatus("idle");
          onSuccess?.();
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to send mentorship request");
      }
    } catch (err) {
      console.error("Error submitting mentorship request:", err);
      setError(err instanceof Error ? err.message : "Failed to send request");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Request Mentorship from {mentorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {status === "success" && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your mentorship request has been sent successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="offering-type" className="mb-3">
              Mentorship Offering
            </Label>
            <Select value={offeringType} onValueChange={setOfferingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select what you're interested in..." />
              </SelectTrigger>
              <SelectContent>
                {MENTORSHIP_OFFERINGS.map((offering) => (
                  <SelectItem key={offering.value} value={offering.value}>
                    {offering.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" className="mb-3">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the mentor why you're interested in their guidance and what you hope to achieve..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || status === "success"}
          >
            {isSubmitting
              ? "Sending Request..."
              : status === "success"
              ? "Request Sent!"
              : "Send Mentorship Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
