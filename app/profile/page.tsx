"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  Save,
  X,
  Camera,
  Clock,
  Calendar,
  MapPin,
  Building,
  GraduationCap,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  title?: string;
  school?: string;
  company?: string;
  bio: string;
  location?: string;
  skills: string[];
  experienceLevel: string;
  availability: string[];
  timeAvailability: string[];
  languages: string[];
  role: string;
  profileComplete: boolean;
  mentor?: {
    specialization: string[];
    pricing?: number;
    category: string;
  };
  mentee?: {
    goals: string[];
    rating?: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData(data);
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      setError("An error occurred while loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
    setPhotoPreview(profile?.photo || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
    setError("");
    setPhotoFile(null);
    setPhotoPreview(profile?.photo || "");
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      let photoUrl = editData.photo; // Keep existing photo if no new one

      // Upload photo if a new one is selected
      if (photoFile) {
        console.log("📷 Uploading new photo...");
        const formData = new FormData();
        formData.append("photo", photoFile);

        const photoResponse = await fetch("/api/upload/photo", {
          method: "POST",
          body: formData,
        });

        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          photoUrl = photoData.url;
          console.log("✅ Photo uploaded:", photoUrl);
        } else {
          const errorData = await photoResponse.json();
          throw new Error(errorData.error || "Photo upload failed");
        }
      }

      console.log("💾 Saving profile data:", {
        ...editData,
        photo: photoUrl,
      });

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editData,
          photo: photoUrl, // Use 'photo' to match what your API expects
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log("✅ Profile updated successfully:", updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview("");
      } else {
        const data = await response.json();
        console.error("❌ Profile update failed:", data);
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      setError(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatEnumValue = (value: string) => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-20">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600 mt-1">
              {profile.role === "MENTOR" ? "Mentor Profile" : "Mentee Profile"}
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        photoPreview ||
                        profile.photo ||
                        session?.user?.profilePicture ||
                        undefined
                      }
                      alt={profile.name}
                    />
                    <AvatarFallback>
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={
                        photoPreview ||
                        profile.photo ||
                        session?.user?.profilePicture ||
                        undefined
                      }
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-2xl font-semibold">{profile.name}</h2>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>

                    {isEditing && (
                      <div>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </label>
                        {photoFile && (
                          <p className="text-xs text-green-600 mt-1">
                            New photo selected: {photoFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Job Title
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.title || ""}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="e.g. Software Engineer"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {profile.title || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Badge variant="secondary" className="w-fit">
                      {formatEnumValue(profile.experienceLevel)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.company || ""}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                        placeholder="e.g. Google, Self-employed"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {profile.company || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      School/University
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.school || ""}
                        onChange={(e) =>
                          handleInputChange("school", e.target.value)
                        }
                        placeholder="e.g. University of West Indies"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {profile.school || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.location || ""}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder="e.g. Kingston, Jamaica"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {profile.location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label>About Me</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    Available Days
                  </Label>
                  {profile.availability && profile.availability.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.availability.map((day) => (
                        <Badge key={day} variant="outline">
                          {formatEnumValue(day)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No availability specified
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4" />
                    Preferred Time Slots
                  </Label>
                  {profile.timeAvailability &&
                  profile.timeAvailability.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.timeAvailability.map((time) => (
                        <Badge key={time} variant="outline">
                          {formatEnumValue(time)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No time preferences specified
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>
                  Technologies and tools I work with
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {formatEnumValue(skill)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No skills listed</p>
                )}
              </CardContent>
            </Card>

            {/* Languages Card */}
            {profile.languages && profile.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Role-specific Cards */}
            {profile.role === "MENTOR" && profile.mentor && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Mentor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <div className="mt-1">
                        <Badge variant="default">
                          {formatEnumValue(profile.mentor.category)}
                        </Badge>
                      </div>
                    </div>

                    {profile.mentor.pricing && (
                      <div>
                        <Label>Hourly Rate</Label>
                        <div className="mt-1">
                          <span className="text-2xl font-bold text-green-600">
                            ${profile.mentor.pricing}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            /hour
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                    <CardDescription>
                      Areas where I offer mentorship
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.mentor.specialization &&
                    profile.mentor.specialization.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.mentor.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {formatEnumValue(spec)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No specializations listed
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {profile.role === "MENTEE" && profile.mentee && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Goals</CardTitle>
                  <CardDescription>What I'm looking to achieve</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.mentee.goals && profile.mentee.goals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.mentee.goals.map((goal) => (
                        <Badge key={goal} variant="secondary">
                          {formatEnumValue(goal)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No goals specified</p>
                  )}

                  {profile.mentee.rating && (
                    <div className="mt-4 pt-4 border-t">
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < Math.floor(profile.mentee!.rating!)
                                  ? "★"
                                  : "☆"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {profile.mentee.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile Completion Status */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      profile.profileComplete ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm">
                    {profile.profileComplete
                      ? "Profile Complete"
                      : "Profile Incomplete"}
                  </span>
                </div>
                {!profile.profileComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push("/profile/complete")}
                  >
                    Complete Profile
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
