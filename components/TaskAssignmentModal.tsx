"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar, Plus } from "lucide-react";

interface TaskAssignmentModalProps {
  menteeId: string;
  menteeName: string;
  onTaskAssigned?: () => void;
  children?: React.ReactNode;
}

export default function TaskAssignmentModal({
  menteeId,
  menteeName,
  onTaskAssigned,
  children,
}: TaskAssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    goalTag: "",
  });

  const goalTags = [
    "GET_INTO_TECH",
    "TRANSITION_CAREER",
    "BUILD_PROJECTS",
    "INTERVIEW_PREP",
    "RESUME_REVIEW",
    "CAREER_GUIDANCE",
    "SKILL_DEVELOPMENT",
    "NETWORKING",
    "PORTFOLIO_REVIEW",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskData.title.trim()) {
      alert("Please provide a task title");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskData.title.trim(),
          description: taskData.description.trim() || null,
          dueDate: taskData.dueDate
            ? new Date(taskData.dueDate).toISOString()
            : null,
          goalTag: taskData.goalTag || null,
          menteeId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Task assigned successfully:", result);

        // Reset form
        setTaskData({
          title: "",
          description: "",
          dueDate: "",
          goalTag: "",
        });

        setIsOpen(false);
        onTaskAssigned?.();

        // Show success message
        alert(
          `Task "${result.task.title}" assigned successfully to ${menteeName}!`
        );
      } else {
        const error = await response.json();
        console.error("Error assigning task:", error);
        alert(`Failed to assign task: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatGoalTag = (tag: string) => {
    return tag
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Assign Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Task to {menteeName}</DialogTitle>
            <DialogDescription>
              Create a task to help guide your mentee's progress and learning
              journey.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={taskData.title}
                onChange={(e) =>
                  setTaskData({ ...taskData, title: e.target.value })
                }
                className="col-span-3"
                placeholder="Task title"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={taskData.description}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Detailed description of the task"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={taskData.dueDate}
                onChange={(e) =>
                  setTaskData({ ...taskData, dueDate: e.target.value })
                }
                className="col-span-3"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goalTag" className="text-right">
                Goal Category
              </Label>
              <Select
                value={taskData.goalTag}
                onValueChange={(value) =>
                  setTaskData({ ...taskData, goalTag: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a goal category" />
                </SelectTrigger>
                <SelectContent>
                  {goalTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {formatGoalTag(tag)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
