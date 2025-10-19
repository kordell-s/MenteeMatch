"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";

const SKILLS = [
  "REACT",
  "NODE_JS",
  "TYPESCRIPT",
  "JAVASCRIPT",
  "PYTHON",
  "JAVA",
  "CSHARP",
  "CPLUSPLUS",
  "RUBY",
  "GO",
  "PHP",
  "SQL",
  "NOSQL",
  "SYSTEM_DESIGN",
  "MICROSERVICES",
  "DEVOPS",
  "AWS",
  "AZURE",
  "DOCKER",
  "KUBERNETES",
  "DATA_SCIENCE",
  "MACHINE_LEARNING",
  "DEEP_LEARNING",
  "COMPUTER_VISION",
  "NLP",
  "MLOPS",
  "BIG_DATA",
  "STATISTICS",
  "UX",
  "UI",
  "FIGMA",
  "DESIGN_SYSTEMS",
  "ACCESSIBILITY",
  "PORTFOLIO_REVIEW",
  "MOTION_DESIGN",
  "PRODUCT_MANAGEMENT",
  "AGILE",
  "SCRUM",
  "USER_RESEARCH",
  "MARKET_ANALYSIS",
  "BUSINESS_STRATEGY",
  "STARTUPS",
  "DIGITAL_MARKETING",
  "CONTENT_STRATEGY",
  "SEO",
  "SOCIAL_MEDIA",
  "BRANDING",
  "GROWTH_HACKING",
  "COPYWRITING",
  "STORYTELLING",
  "INTERVIEW_PREP",
  "RESUME_REVIEW",
  "CAREER_COACHING",
  "PUBLIC_SPEAKING",
  "NETWORKING",
  "LEADERSHIP",
  "TEAM_MANAGEMENT",
];

// Updated SPECIALIZATIONS to match your Prisma enum
const SPECIALIZATIONS = [
  // Development & Engineering
  "FRONTEND_DEVELOPMENT",
  "BACKEND_DEVELOPMENT",
  "FULLSTACK_DEVELOPMENT",
  "MOBILE_DEVELOPMENT",
  "WEB_DEVELOPMENT",
  "SOFTWARE_ENGINEERING",
  "SYSTEM_ARCHITECTURE",
  "DATABASE_DESIGN",

  // DevOps & Infrastructure
  "DEVOPS_ENGINEERING",
  "CLOUD_COMPUTING",
  "INFRASTRUCTURE_MANAGEMENT",
  "DEPLOYMENT_AUTOMATION",
  "SYSTEM_ADMINISTRATION",

  // Data & AI
  "DATA_ENGINEERING",
  "DATA_ANALYSIS",
  "MACHINE_LEARNING_ENGINEERING",
  "AI_DEVELOPMENT",
  "BIG_DATA_PROCESSING",
  "BUSINESS_INTELLIGENCE",

  // Design & UX
  "UI_UX_DESIGN",
  "PRODUCT_DESIGN",
  "GRAPHIC_DESIGN",
  "USER_RESEARCH",
  "DESIGN_SYSTEMS",
  "ACCESSIBILITY_DESIGN",

  // Business & Strategy
  "PRODUCT_MANAGEMENT",
  "PROJECT_MANAGEMENT",
  "BUSINESS_ANALYSIS",
  "STRATEGIC_PLANNING",
  "STARTUP_CONSULTING",
  "DIGITAL_TRANSFORMATION",

  // Marketing & Growth
  "DIGITAL_MARKETING",
  "CONTENT_MARKETING",
  "GROWTH_MARKETING",
  "SOCIAL_MEDIA_STRATEGY",
  "BRAND_MANAGEMENT",
  "SEO_OPTIMIZATION",

  // Career & Personal Development
  "CAREER_COACHING",
  "TECHNICAL_INTERVIEWING",
  "RESUME_OPTIMIZATION",
  "LEADERSHIP_DEVELOPMENT",
  "TEAM_BUILDING",
  "PUBLIC_SPEAKING",
  "NETWORKING_STRATEGY",

  // Industry Specific
  "FINTECH_DEVELOPMENT",
  "HEALTHCARE_TECH",
  "E_COMMERCE_DEVELOPMENT",
  "GAMING_DEVELOPMENT",
  "BLOCKCHAIN_DEVELOPMENT",
  "CYBERSECURITY",

  // Other
  "FREELANCING_GUIDANCE",
  "REMOTE_WORK_CONSULTING",
  "TECHNICAL_WRITING",
  "API_DEVELOPMENT",
  "QUALITY_ASSURANCE",
];

const GOALS = [
  "GET_INTO_TECH",
  "TRANSITION_CAREER",
  "BUILD_PROJECTS",
  "FIND_MENTOR",
  "INTERVIEW_PREP",
  "RESUME_REVIEW",
  "CAREER_GUIDANCE",
  "LEARN_CODING",
  "PUBLIC_SPEAKING",
  "NETWORKING",
];

const MENTOR_CATEGORIES = [
  "TECHNOLOGY",
  "BUSINESS",
  "DESIGN",
  "MARKETING",
  "CREATIVE",
  "HEALTH",
  "MUSIC",
  "OTHER",
];

const EXPERIENCE_LEVELS = ["STUDENT", "ENTRY", "MID", "SENIOR", "LEAD"];

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const TIME_SLOTS = [
  "EARLY_MORNING",
  "MORNING",
  "AFTERNOON",
  "EVENING",
  "LATE_EVENING",
];

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    experienceLevel: "ENTRY",
    company: "",
    title: "",
    school: "",
    location: "",
    languages: [] as string[],
    availability: [] as string[],
    timeAvailability: [] as string[],
    // Mentor specific
    specialization: [] as string[], // This will use SPECIALIZATIONS array
    category: "OTHER",
    // Mentee specific
    goals: [] as string[],
    detailedGoals: "",
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isMentor = session.user.role === "MENTOR";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (
    field: keyof typeof formData,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl("");
    const fileInput = document.getElementById(
      "profile-picture"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Handle file upload if present
      let profilePictureUrl = "";
      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profilePictureUrl = uploadData.url;
        }
      }

      // Update profile
      const response = await fetch("/api/profile/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl || undefined,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Complete Your Profile
            </CardTitle>
            <p className="text-center text-gray-600">
              Help others learn more about you and your expertise
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Upload size={20} className="text-gray-400" />
                    </div>
                  )}
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100"
                  >
                    Choose Photo
                  </Label>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                  rows={4}
                  required
                />
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label>Skills *</Label>
                <p className="text-sm text-gray-600">
                  Select the specific technologies and tools you work with
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {SKILLS.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={(checked) =>
                          handleMultiSelect("skills", skill, checked as boolean)
                        }
                      />
                      <Label htmlFor={`skill-${skill}`} className="text-sm">
                        {skill
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, experienceLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role-specific fields */}
              {isMentor ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Mentor Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MENTOR_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) +
                              category.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Updated Specializations Section */}
                  <div className="space-y-3">
                    <Label>Specializations *</Label>
                    <p className="text-sm text-gray-600">
                      Select the broad areas you specialize in (different from
                      specific technical skills)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                      {SPECIALIZATIONS.map((specialization) => (
                        <div
                          key={specialization}
                          className="flex items-center space-x-2 p-2 bg-white rounded border"
                        >
                          <Checkbox
                            id={`spec-${specialization}`}
                            checked={formData.specialization.includes(
                              specialization
                            )}
                            onCheckedChange={(checked) =>
                              handleMultiSelect(
                                "specialization",
                                specialization,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={`spec-${specialization}`}
                            className="text-sm font-medium"
                          >
                            {specialization
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.specialization.length > 0 && (
                      <p className="text-xs text-green-600">
                        Selected {formData.specialization.length} specialization
                        {formData.specialization.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Goal Categories *</Label>
                    <p className="text-sm text-gray-600">
                      Select general categories that match your goals
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {GOALS.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal}`}
                            checked={formData.goals.includes(goal)}
                            onCheckedChange={(checked) =>
                              handleMultiSelect("goals", goal, checked as boolean)
                            }
                          />
                          <Label htmlFor={`goal-${goal}`} className="text-sm">
                            {goal
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detailedGoals">
                      Describe Your Goals in Detail *
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (This helps us find your perfect mentor match!)
                      </span>
                    </Label>
                    <p className="text-sm text-gray-600">
                      Be specific about what you want to learn, challenges you're facing, and what you hope to achieve.
                      The more detail you provide, the better we can match you with the right mentor.
                    </p>
                    <Textarea
                      id="detailedGoals"
                      name="detailedGoals"
                      value={formData.detailedGoals}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="e.g., I want to develop my UI design skills and learn industry best practices for creating accessible, user-friendly interfaces. I'm particularly interested in learning Figma and building a strong portfolio to transition from graphic design into UX/UI design. I'm also looking for guidance on breaking into the tech industry and preparing for design interviews."
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Google, Self-employed, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Software Engineer, Student, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/University</Label>
                <Input
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="University of West Indies, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Kingston, Jamaica"
                />
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <Label>Days Available</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={formData.availability.includes(day)}
                        onCheckedChange={(checked) =>
                          handleMultiSelect(
                            "availability",
                            day,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`day-${day}`} className="text-sm">
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Time Preferences</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${slot}`}
                        checked={formData.timeAvailability.includes(slot)}
                        onCheckedChange={(checked) =>
                          handleMultiSelect(
                            "timeAvailability",
                            slot,
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`time-${slot}`} className="text-sm">
                        {slot
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
