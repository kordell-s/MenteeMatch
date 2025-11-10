"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Calendar,
  Target,
  Loader2,
} from "lucide-react";

interface RoadmapWizardProps {
  open: boolean;
  onClose: () => void;
  mentorshipId: string;
  menteeName: string;
}

interface Milestone {
  title: string;
  description: string;
  dueDate: string;
}

export default function RoadmapWizard({
  open,
  onClose,
  mentorshipId,
  menteeName,
}: RoadmapWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(8);
  const [focusArea, setFocusArea] = useState("");

  // Step 2: Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone>({
    title: "",
    description: "",
    dueDate: "",
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddMilestone = () => {
    if (currentMilestone.title && currentMilestone.dueDate) {
      setMilestones([...milestones, currentMilestone]);
      setCurrentMilestone({ title: "", description: "", dueDate: "" });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/roadmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorshipId,
          title,
          description,
          duration,
          focusArea,
          milestones: milestones.length > 0 ? milestones : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create roadmap");
      }

      const data = await response.json();

      // Close modal and navigate to the new roadmap
      onClose();
      router.push(`/dashboard/roadmap/${data.roadmap.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating roadmap:", error);
      alert(
        `Failed to create roadmap: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = title && duration && focusArea;
  const canProceedStep2 = milestones.length >= 2; // At least 2 milestones recommended

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-brand-navy">
            Create Roadmap for {menteeName}
          </DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}:{" "}
            {step === 1
              ? "Basic Information"
              : step === 2
              ? "Add Milestones"
              : "Review & Create"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  s < step
                    ? "bg-brand-teal border-brand-teal text-white"
                    : s === step
                    ? "bg-white border-brand-teal text-brand-teal"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? "bg-brand-teal" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Roadmap Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full-Stack Development Journey"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of what this roadmap will cover..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select
                value={duration.toString()}
                onValueChange={(v) => setDuration(parseInt(v))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="focusArea">Focus Area *</Label>
              <Input
                id="focusArea"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g., React & Next.js, System Design, etc."
                className="mt-1"
              />
            </div>

            <div className="bg-brand-sky/10 p-4 rounded-lg border border-brand-sky/20">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-brand-teal mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    Planning your roadmap
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Choose a duration that matches your mentee's goals and
                    availability. You'll define milestones in the next step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Milestones */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-gold/10 p-3 rounded-lg border border-brand-gold/20">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Create at least 2-4 milestones. Each
                milestone represents a significant checkpoint in the learning
                journey.
              </p>
            </div>

            {/* Added Milestones */}
            {milestones.length > 0 && (
              <div className="space-y-2">
                <Label>Added Milestones ({milestones.length})</Label>
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-brand-sky/10 rounded-lg border border-brand-sky/20"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-teal text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-navy">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {milestone.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Milestone */}
            <div className="border-2 border-dashed border-brand-teal/30 rounded-lg p-4 space-y-3">
              <Label>Add Milestone</Label>
              <Input
                value={currentMilestone.title}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    title: e.target.value,
                  })
                }
                placeholder="Milestone title..."
              />
              <Textarea
                value={currentMilestone.description}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    description: e.target.value,
                  })
                }
                placeholder="What will be achieved in this milestone?"
                rows={2}
              />
              <Input
                type="date"
                value={currentMilestone.dueDate}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    dueDate: e.target.value,
                  })
                }
                min={new Date().toISOString().split("T")[0]}
              />
              <Button
                onClick={handleAddMilestone}
                disabled={
                  !currentMilestone.title || !currentMilestone.dueDate
                }
                className="w-full bg-brand-teal hover:bg-brand-navy text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-brand-sky/10 p-4 rounded-lg border border-brand-sky/20">
              <h3 className="font-semibold text-brand-navy mb-3">
                Review Your Roadmap
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium text-brand-navy">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <Badge className="bg-brand-teal text-white">
                    {duration} weeks
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Focus Area:</span>
                  <span className="font-medium text-brand-navy">
                    {focusArea}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Milestones:</span>
                  <Badge className="bg-brand-gold text-white">
                    {milestones.length}
                  </Badge>
                </div>
              </div>
            </div>

            {description && (
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">
                  {description}
                </p>
              </div>
            )}

            <div>
              <Label className="mb-2">Milestones Timeline</Label>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-brand-navy">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {milestone.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Ready to create!</strong> Your mentee will be able to
                view this roadmap and track their progress through each
                milestone.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="bg-brand-teal hover:bg-brand-navy text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-brand-teal hover:bg-brand-navy text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Roadmap
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
