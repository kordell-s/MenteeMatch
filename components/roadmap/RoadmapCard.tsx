import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import ProgressBar from "./ProgressBar";

interface RoadmapCardProps {
  roadmap: {
    id: string;
    title: string;
    description?: string;
    duration: number;
    focusArea: string;
    status: string;
    startDate: string;
    endDate: string;
    milestones: any[];
    mentorship: {
      mentee: {
        id: string;
        name: string;
        profilePicture?: string;
      };
    };
    progress?: {
      milestones: {
        total: number;
        completed: number;
        percentage: number;
      };
      tasks: {
        total: number;
        completed: number;
        percentage: number;
      };
    };
  };
  onArchive?: () => void;
  onComplete?: () => void;
  isMentor?: boolean;
}

export default function RoadmapCard({
  roadmap,
  onArchive,
  onComplete,
  isMentor = false,
}: RoadmapCardProps) {
  const router = useRouter();

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
    PAUSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ARCHIVED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusIcons = {
    ACTIVE: <TrendingUp className="h-3 w-3" />,
    COMPLETED: <CheckCircle className="h-3 w-3" />,
    PAUSED: <Clock className="h-3 w-3" />,
    ARCHIVED: <AlertCircle className="h-3 w-3" />,
  };

  const handleViewClick = () => {
    router.push(`/dashboard/roadmap/${roadmap.id}`);
  };

  const totalMilestones = roadmap.milestones?.length || 0;
  const completedMilestones =
    roadmap.milestones?.filter((m) => m.status === "COMPLETED").length || 0;
  const progressPercentage = roadmap.progress?.milestones?.percentage || 0;

  // Determine progress bar color based on roadmap status
  const getProgressBarColor = (): "teal" | "blue" | "gray" => {
    switch (roadmap.status) {
      case "COMPLETED":
        return "blue";
      case "PAUSED":
      case "ARCHIVED":
        return "gray";
      case "ACTIVE":
      default:
        return "teal";
    }
  };

  return (
    <Card className="border-2 border-brand-sky/30 hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-brand-sky/5 border-b border-brand-sky/20 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-brand-navy">
                {roadmap.title}
              </CardTitle>
              <Badge
                className={`flex items-center gap-1 ${
                  statusColors[roadmap.status as keyof typeof statusColors]
                }`}
              >
                {statusIcons[roadmap.status as keyof typeof statusIcons]}
                {roadmap.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-brand-gold" />
                <span>{roadmap.focusArea}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-brand-teal" />
                <span>{roadmap.duration} weeks</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {roadmap.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {roadmap.description}
          </p>
        )}

        {/* Progress Section */}
        <div className="mb-4">
          <ProgressBar
            percentage={progressPercentage}
            label="Milestone Progress"
            colorScheme={getProgressBarColor()}
          />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className={roadmap.status === "COMPLETED" ? "text-blue-600 font-semibold" : "text-gray-500"}>
              {roadmap.status === "COMPLETED" && progressPercentage === 100 ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All milestones completed
                </span>
              ) : (
                `${completedMilestones}/${totalMilestones} milestones completed`
              )}
            </span>
            <span className="text-gray-500">
              {roadmap.progress?.tasks?.completed || 0}/
              {roadmap.progress?.tasks?.total || 0} tasks
            </span>
          </div>
        </div>

        {/* Mentee Info (for mentor view) */}
        {isMentor && roadmap.mentorship?.mentee && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-brand-sky/10 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center text-sm font-semibold">
              {roadmap.mentorship.mentee.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-brand-navy">
                {roadmap.mentorship.mentee.name}
              </p>
              <p className="text-xs text-gray-500">Mentee</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded">
          <div>
            <p className="font-medium text-gray-700">Start</p>
            <p>{new Date(roadmap.startDate).toLocaleDateString()}</p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="text-right">
            <p className="font-medium text-gray-700">End</p>
            <p>{new Date(roadmap.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleViewClick}
            className="flex-1 bg-brand-teal hover:bg-brand-navy text-white"
          >
            View Roadmap
          </Button>
          {isMentor && roadmap.status === "ACTIVE" && (
            <>
              {onComplete && (
                <Button
                  variant="default"
                  onClick={onComplete}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
              {onArchive && (
                <Button
                  variant="outline"
                  onClick={onArchive}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Archive
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
