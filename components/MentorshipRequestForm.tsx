"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Send } from "lucide-react";

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
  const { data: session } = useSession();
  const [offeringType, setOfferingType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!offeringType) {
      setError("Pick what you want help with.");
      return false;
    }
    if (!message.trim()) {
      setError("Add a short note so they know what you need.");
      return false;
    }
    if (message.trim().length < 20) {
      setError("Add a little more detail (at least 20 characters).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!session?.user?.id) {
      setError("You must be logged in to send a mentorship request");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/mentorship-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menteeId: session.user.id,
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
        }, 1200);
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
    <form onSubmit={handleSubmit} className="grid gap-5">
      {status === "success" && (
        <p role="status" className="flex items-center gap-2 rounded-[10px] bg-tape-green-soft px-3.5 py-3 text-[15px] font-medium text-green-800">
          <CheckCircle className="size-4" aria-hidden="true" /> Request sent to {mentorName}.
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-[10px] bg-tape-red-soft px-3.5 py-3 text-[15px] text-red-800">
          <AlertCircle className="size-4" aria-hidden="true" /> {error}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">What do you want help with?</legend>
        <div className="flex flex-wrap gap-2">
          {MENTORSHIP_OFFERINGS.map((o) => {
            const on = offeringType === o.value;
            return (
              <label
                key={o.value}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-ink text-chalk" : "border-ink/15 text-ink hover:border-ink/40"
                }`}
              >
                <input type="radio" name="offering" value={o.value} checked={on} onChange={() => setOfferingType(o.value)} className="sr-only" />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="message">Your note</Label>
        <Textarea
          id="message"
          placeholder="What you're working toward, where you're stuck, and why you'd like their help."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={500}
          aria-describedby="message-count"
        />
        <p id="message-count" className="tabular text-sm text-ink-soft">{message.length}/500</p>
      </div>

      <Button type="submit" variant="tape" size="lg" className="w-full" disabled={isSubmitting || status === "success"}>
        <Send aria-hidden="true" />
        {isSubmitting ? "Sending" : status === "success" ? "Sent" : "Send request"}
      </Button>
    </form>
  );
}
