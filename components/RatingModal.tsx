"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRating from "./StarRating";
import { Loader2 } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  mentorId: string;
  mentorName: string;
  onSuccess?: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  sessionId,
  mentorId,
  mentorName,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          mentorId,
          ratingValue: rating,
          feedback: feedback.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setRating(0);
        setFeedback("");

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onClose();
      } else {
        setError(data.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setFeedback("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-brand-navy">Rate Your Session</DialogTitle>
          <DialogDescription>
            How was your session with {mentorName}? Your feedback helps improve
            the mentoring experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <Label className="text-base font-medium">Your Rating</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
            />
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Feedback <span className="text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this session..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Your feedback will help {mentorName} improve their mentoring
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="bg-brand-teal hover:bg-brand-navy"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
