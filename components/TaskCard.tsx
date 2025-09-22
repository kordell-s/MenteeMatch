"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Clock, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate?: string | null;
  goalTag?: string | null;
  mentee: {
    id: string;
    name: string;
  };
}

interface TaskCardProps {
  task: Task;
  onStatusUpdate?: (taskId: string, newStatus: string) => void;
}

export default function TaskCard({ task, onStatusUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatGoalTag = (tag: string) => {
    return tag
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      // You could add a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`${isOverdue ? "border-red-200 bg-red-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{task.mentee.name}</span>
            </div>
          </div>
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-sm ${
                isOverdue ? "text-red-600" : "text-gray-500"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {task.goalTag && (
            <Badge variant="outline" className="text-xs">
              {formatGoalTag(task.goalTag)}
            </Badge>
          )}
        </div>

        {isOverdue && (
          <div className="flex items-center gap-1 text-sm text-red-600 mb-3">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Overdue</span>
          </div>
        )}

        {task.status !== "COMPLETED" && onStatusUpdate && (
          <div className="flex flex-col gap-2 mt-3">
            {task.status === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                className="flex items-center justify-center gap-1 w-full"
                disabled={isUpdating}
              >
                <CheckSquare className="h-4 w-4" />
                {isUpdating ? "Updating..." : "Mark In Progress"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleStatusUpdate("COMPLETED")}
              className="flex items-center justify-center gap-1 w-full"
              disabled={isUpdating}
            >
              <CheckSquare className="h-4 w-4" />
              {isUpdating ? "Updating..." : "Mark Complete"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
