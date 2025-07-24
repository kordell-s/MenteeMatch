"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit } from "lucide-react";
import MentorCard from "./MentorCard";
import { Mentor } from "@/app/types/mentor";

// Available goals based on the Goal enum from schema
const availableGoals = [
  { value: "GET_INTO_TECH", label: "Get into tech" },
  { value: "TRANSITION_CAREER", label: "Career transition" },
  { value: "BUILD_PROJECTS", label: "Build projects" },
  { value: "FIND_MENTOR", label: "Find mentor" },
  { value: "INTERVIEW_PREP", label: "Interview preparation" },
  { value: "RESUME_REVIEW", label: "Resume review" },
  { value: "CAREER_GUIDANCE", label: "Career guidance" },
  { value: "LEARN_CODING", label: "Learn coding" },
  { value: "PUBLIC_SPEAKING", label: "Public speaking" },
  { value: "NETWORKING", label: "Networking" },
];

interface RecommendedMentorsProps {
  mentors: Mentor[];
}

export default function RecommendedMentors({
  mentors,
}: RecommendedMentorsProps) {
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user goals on component mount
  useEffect(() => {
    async function fetchUserGoals() {
      try {
        // You'll need to implement this API endpoint to get current user's goals
        const response = await fetch("/api/user/goals");
        if (response.ok) {
          const data = await response.json();
          const goals = data.goals || [];
          setUserGoals(goals);
          setSelectedGoals(goals);
        }
      } catch (error) {
        console.error("Failed to fetch user goals:", error);
        // Fallback to empty goals
        setUserGoals([]);
        setSelectedGoals([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserGoals();
  }, []);

  const handleGoalToggle = (goalValue: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalValue)
        ? prev.filter((g) => g !== goalValue)
        : [...prev, goalValue]
    );
  };

  const handleUpdateGoals = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/user/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: selectedGoals }),
      });

      if (response.ok) {
        setUserGoals(selectedGoals);
        setIsDialogOpen(false);
      } else {
        console.error("Failed to update goals");
      }
    } catch (error) {
      console.error("Error updating goals:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Convert enum values to readable labels
  const getGoalLabel = (goalValue: string) => {
    const goal = availableGoals.find((g) => g.value === goalValue);
    return goal ? goal.label : goalValue;
  };

  // Get top 3 recommended mentors
  const topRecommended = mentors.slice(0, 3);
  // Get remaining mentors
  const otherMentors = mentors.slice(3);

  return (
    <div className="space-y-12">
      {/* Personalized recommendations section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Based on your goals</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10 font-bold"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update your goals
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Your Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select the goals that best describe what you want to achieve:
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableGoals.map((goal) => (
                    <div
                      key={goal.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={goal.value}
                        checked={selectedGoals.includes(goal.value)}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                      />
                      <label
                        htmlFor={goal.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {goal.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateGoals} disabled={updating}>
                    {updating ? "Updating..." : "Update Goals"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Your current goals:</h3>
          {loading ? (
            <p className="text-gray-600">Loading your goals...</p>
          ) : userGoals.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {userGoals.map((goal, index) => (
                <li key={index}>{getGoalLabel(goal)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              No goals set yet. Click "Update your goals" to get started!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRecommended.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} recommended={true} />
          ))}
        </div>
      </div>

      {/* Recently active mentors */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recently active mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMentors.slice(0, 3).map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>

      {/* Popular in your network */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Popular in your network</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMentors.slice(3, 6).map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>
    </div>
  );
}
