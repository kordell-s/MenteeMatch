"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  order: number;
  tasks?: { id: string; completed: boolean }[];
  checkIns?: { id: string; status: string }[];
}

interface RoadmapTimelineProps {
  milestones: Milestone[];
  layout?: "horizontal" | "vertical";
  onMilestoneClick?: (milestone: Milestone) => void;
}

export default function RoadmapTimeline({
  milestones,
  layout = "vertical",
  onMilestoneClick,
}: RoadmapTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-6 w-6 text-brand-gold" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-brand-gold";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 text-white">Completed</Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-brand-gold text-white">In Progress</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-400 text-white">Not Started</Badge>
        );
    }
  };

  const isOverdue = (dueDate: string | Date, status: string) => {
    if (status === "COMPLETED") return false;
    return new Date(dueDate) < new Date();
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  if (layout === "horizontal") {
    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max px-4">
          {sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start">
              {/* Milestone Node */}
              <div
                className={`flex flex-col items-center ${
                  onMilestoneClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onMilestoneClick?.(milestone)}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg ${getStatusColor(
                    milestone.status
                  )} transition-all hover:scale-110`}
                >
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content */}
                <div className="mt-4 w-64 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500">
                      #{milestone.order}
                    </span>
                  </div>
                  <h3 className="font-semibold text-brand-navy text-sm mb-1 line-clamp-2">
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </div>
                  {getStatusBadge(milestone.status)}
                  {isOverdue(milestone.dueDate, milestone.status) && (
                    <Badge className="bg-red-500 text-white mt-1">
                      Overdue
                    </Badge>
                  )}
                  {milestone.tasks && (
                    <p className="text-xs text-gray-500 mt-2">
                      {milestone.tasks.filter((t) => t.completed).length}/
                      {milestone.tasks.length} tasks
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {index < sortedMilestones.length - 1 && (
                <div
                  className={`h-1 w-16 mt-6 ${
                    milestone.status === "COMPLETED"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical Layout
  return (
    <div className="relative pl-8">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

      {sortedMilestones.map((milestone, index) => {
        const completedTasks =
          milestone.tasks?.filter((t) => t.completed).length || 0;
        const totalTasks = milestone.tasks?.length || 0;

        return (
          <div key={milestone.id} className="relative mb-8 last:mb-0">
            {/* Timeline Node */}
            <div className="absolute -left-2 top-0">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg ${getStatusColor(
                  milestone.status
                )} transition-all`}
              >
                {getStatusIcon(milestone.status)}
              </div>
            </div>

            {/* Content Card */}
            <div
              className={`ml-12 p-4 bg-white rounded-lg border-2 transition-all ${
                milestone.status === "COMPLETED"
                  ? "border-green-500/30 bg-green-50"
                  : milestone.status === "IN_PROGRESS"
                  ? "border-brand-gold/30 bg-brand-gold/5"
                  : "border-gray-200"
              } ${
                onMilestoneClick
                  ? "cursor-pointer hover:shadow-lg hover:border-brand-teal"
                  : ""
              }`}
              onClick={() => onMilestoneClick?.(milestone)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-teal text-white">
                    Milestone {milestone.order}
                  </Badge>
                  {getStatusBadge(milestone.status)}
                  {isOverdue(milestone.dueDate, milestone.status) && (
                    <Badge className="bg-red-500 text-white">Overdue</Badge>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-brand-navy text-lg mb-1">
                {milestone.title}
              </h3>

              {milestone.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {milestone.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {totalTasks > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </div>
                )}

                {milestone.checkIns && milestone.checkIns.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{milestone.checkIns.length} check-ins</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
