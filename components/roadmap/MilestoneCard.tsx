import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  Link as LinkIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Video,
  BookOpen,
} from "lucide-react";

interface MilestoneCardProps {
  milestone: {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: string;
    order: number;
    tasks?: any[];
    checkIns?: any[];
    resources?: any[];
  };
  isMentor?: boolean;
  onStatusChange?: (status: string) => void;
  onAddResource?: () => void;
  onScheduleCheckIn?: () => void;
}

export default function MilestoneCard({
  milestone,
  isMentor = false,
  onStatusChange,
  onAddResource,
  onScheduleCheckIn,
}: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    NOT_STARTED: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <Clock className="h-3 w-3" />,
      label: "Not Started",
    },
    IN_PROGRESS: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <PlayCircle className="h-3 w-3" />,
      label: "In Progress",
    },
    COMPLETED: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Completed",
    },
  };

  const resourceIcons = {
    LINK: <LinkIcon className="h-4 w-4" />,
    VIDEO: <Video className="h-4 w-4" />,
    ARTICLE: <BookOpen className="h-4 w-4" />,
    DOCUMENT: <FileText className="h-4 w-4" />,
    OTHER: <FileText className="h-4 w-4" />,
  };

  const currentStatus = statusConfig[milestone.status as keyof typeof statusConfig];
  const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "COMPLETED";

  const completedTasks = milestone.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
  const totalTasks = milestone.tasks?.length || 0;

  return (
    <Card
      className={`border-2 transition-all ${
        milestone.status === "COMPLETED"
          ? "border-green-200 bg-green-50/30"
          : isOverdue
          ? "border-red-200 bg-red-50/30"
          : "border-brand-sky/30"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-sm">
                {milestone.order}
              </div>
              <CardTitle className="text-base text-brand-navy">
                {milestone.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap ml-10">
              <Badge className={`flex items-center gap-1 ${currentStatus.color}`}>
                {currentStatus.icon}
                {currentStatus.label}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(milestone.dueDate).toLocaleDateString()}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-brand-navy"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {milestone.description && (
          <p className="text-sm text-gray-600 mb-3 ml-10">
            {milestone.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 ml-10">
          {totalTasks > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-brand-teal" />
              <span>
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
          )}
          {milestone.resources && milestone.resources.length > 0 && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4 text-brand-gold" />
              <span>{milestone.resources.length} resources</span>
            </div>
          )}
          {milestone.checkIns && milestone.checkIns.length > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-brand-orange" />
              <span>{milestone.checkIns.length} check-ins</span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 ml-10 pt-3 border-t border-gray-200">
            {/* Resources */}
            {milestone.resources && milestone.resources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-brand-navy mb-2">
                  Resources
                </h4>
                <div className="space-y-2">
                  {milestone.resources.map((resource: any) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-brand-sky/10 hover:bg-brand-sky/20 rounded transition-colors group"
                    >
                      <div className="text-brand-teal">
                        {resourceIcons[resource.resourceType as keyof typeof resourceIcons]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-navy group-hover:text-brand-teal truncate">
                          {resource.title}
                        </p>
                        {resource.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Check-ins */}
            {milestone.checkIns && milestone.checkIns.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-brand-navy mb-2">
                  Upcoming Check-ins
                </h4>
                <div className="space-y-2">
                  {milestone.checkIns
                    .filter((c: any) => c.status !== "COMPLETED")
                    .map((checkIn: any) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-brand-orange" />
                          <span className="text-sm text-gray-700">
                            {new Date(checkIn.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className="text-xs">{checkIn.status}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {isMentor && milestone.status !== "COMPLETED" && (
                <>
                  {onAddResource && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onAddResource}
                      className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Add Resource
                    </Button>
                  )}
                  {onScheduleCheckIn && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onScheduleCheckIn}
                      className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule Check-in
                    </Button>
                  )}
                </>
              )}
              {onStatusChange && milestone.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  onClick={() =>
                    onStatusChange(
                      milestone.status === "NOT_STARTED"
                        ? "IN_PROGRESS"
                        : "COMPLETED"
                    )
                  }
                  className="bg-brand-teal hover:bg-brand-navy text-white"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark as{" "}
                  {milestone.status === "NOT_STARTED"
                    ? "In Progress"
                    : "Completed"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
