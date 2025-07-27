"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mentor } from "@/app/types/mentor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  Clock,
  Award,
  Building,
  GraduationCap,
  Globe,
  DollarSign,
  CheckCircle,
  Mail,
} from "lucide-react";
import MentorshipRequestForm from "@/components/MentorshipRequestForm";
import SessionSchedulingModal from "@/components/SessionSchedulingModal";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function MentorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMentorship, setHasMentorship] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // Get mentor data from sessionStorage (set during navigation)
    const mentorData = sessionStorage.getItem("selectedMentor");
    if (mentorData) {
      try {
        const parsedMentor = JSON.parse(mentorData);
        console.log("Parsed mentor data:", parsedMentor); // Debug log
        setMentor(parsedMentor);
        // Check if mentorship exists
        checkMentorshipStatus(parsedMentor.id);
      } catch (error) {
        console.error("Error parsing mentor data:", error);
        router.push("/");
        return;
      }
    } else {
      console.log("No mentor data found in sessionStorage"); // Debug log
      router.push("/");
      return;
    }
    setLoading(false);
  }, [router, status, session]);

  const checkMentorshipStatus = async (mentorId: string) => {
    try {
      // Use session user ID instead of hardcoded or localStorage
      if (!session?.user?.id) {
        console.error("No user ID in session");
        return;
      }

      const response = await fetch(
        `/api/mentorships?userId=${session.user.id}&role=MENTEE`
      );
      if (response.ok) {
        const mentorships = await response.json();
        const exists = mentorships.some((m: any) => m.mentorId === mentorId);
        setHasMentorship(exists);
      }
    } catch (error) {
      console.error("Error checking mentorship status:", error);
    }
  };

  // Clear sessionStorage after component has mounted and data is loaded
  useEffect(() => {
    if (mentor && !loading) {
      // Clear the data after successful load for security
      sessionStorage.removeItem("selectedMentor");
    }
  }, [mentor, loading]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Mentor not found</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gray-800 px-8 py-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <img
                  src={mentor.profilePicture || "/default-avatar.png"}
                  alt={mentor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              <div className="flex-grow text-white">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                  {mentor.name}
                  {mentor.verified && (
                    <CheckCircle className="text-green-400" size={24} />
                  )}
                </h1>

                <p className="text-xl mb-2">{mentor.title}</p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {mentor.company && (
                    <div className="flex items-center gap-1">
                      <Building size={16} />
                      <span>{mentor.company}</span>
                    </div>
                  )}

                  {mentor.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{mentor.location}</span>
                    </div>
                  )}

                  {mentor.rating && (
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="font-medium">{mentor.rating}/5</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {hasMentorship ? (
                    <SessionSchedulingModal
                      mentorId={mentor.id}
                      mentorName={mentor.name}
                      onSuccess={() => {
                        alert("Session scheduled successfully!");
                      }}
                    >
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2 text-black"
                      >
                        <Calendar size={16} />
                        Schedule Session
                      </Button>
                    </SessionSchedulingModal>
                  ) : (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="flex items-center gap-2 text-black"
                        >
                          <Calendar size={16} />
                          Request Mentorship
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-2">
                          <MentorshipRequestForm
                            mentorId={mentor.id}
                            mentorName={mentor.name}
                            onSuccess={() => {
                              checkMentorshipStatus(mentor.id);
                              setIsDialogOpen(false);
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-black border-white hover:bg-white hover:text-gray-800"
                  >
                    <MessageCircle size={16} />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-black border-white hover:bg-white hover:text-gray-800"
                  >
                    <Mail size={16} />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                {mentor.bio && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                      <Award className="text-gray-600" size={24} />
                      About
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {mentor.bio}
                    </p>
                  </div>
                )}

                {/* Skills & Expertise */}
                {mentor.skills && mentor.skills.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Skills & Expertise
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {typeof skill === "string"
                            ? skill.replace(/_/g, " ")
                            : skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialization */}
                {mentor.mentor?.specialization &&
                  mentor.mentor.specialization.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">
                        Specialization Areas
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mentor.mentor.specialization.map((area, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                          >
                            <CheckCircle className="text-gray-600" size={16} />
                            <span className="text-gray-800 font-medium">
                              {area}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Experience */}
                {mentor.experience &&
                  Array.isArray(mentor.experience) &&
                  mentor.experience.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">
                        Professional Experience
                      </h2>
                      <div className="space-y-4">
                        {mentor.experience.map((exp, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500"
                          >
                            <p className="text-gray-700">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Education */}
                {mentor.school && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="text-gray-600" size={24} />
                      Education History
                    </h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 font-medium">
                        {mentor.school}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mentorship Offerings */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Mentorship Offerings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        1-on-1 Sessions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Personalized mentoring tailored to your goals
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Career Guidance
                      </h3>
                      <p className="text-sm text-gray-600">
                        Strategic advice for career advancement
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Skill Development
                      </h3>
                      <p className="text-sm text-gray-600">
                        Technical and soft skills improvement
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Portfolio Review
                      </h3>
                      <p className="text-sm text-gray-600">
                        Feedback on projects and professional portfolio
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info Card */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Info</h3>

                  {/* Category */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700"
                    >
                      {mentor.category?.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Experience Level */}
                  {mentor.experienceLevel && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Experience Level
                      </p>
                      <p className="font-medium">{mentor.experienceLevel}</p>
                    </div>
                  )}

                  {/* Availability */}
                  {mentor.availability && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Availability</p>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <p className="text-gray-700 font-medium">
                          {mentor.availability}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {mentor.languages &&
                    Array.isArray(mentor.languages) &&
                    mentor.languages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Languages</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.languages.map((language, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-700"
                            >
                              <Globe size={12} className="mr-1" />
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Pricing */}
                  {mentor.mentor?.pricing && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Session Price
                      </p>
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-gray-600" />
                        <span className="text-2xl font-bold text-gray-600">
                          {mentor.mentor.pricing}
                        </span>
                        <span className="text-gray-500">/session</span>
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  {mentor.createdAt && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="font-medium">
                        {new Date(mentor.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Card */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Ready to Connect?
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Start your mentorship journey with {mentor.name}
                  </p>
                  <div className="space-y-2">
                    {hasMentorship ? (
                      <>
                        <SessionSchedulingModal
                          mentorId={mentor.id}
                          mentorName={mentor.name}
                          onSuccess={() => {
                            alert("Session scheduled successfully!");
                          }}
                        >
                          <Button className="w-full">
                            <Calendar className="mr-2" size={16} />
                            Schedule Session
                          </Button>
                        </SessionSchedulingModal>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="mr-2" size={16} />
                          Send Message
                        </Button>
                      </>
                    ) : (
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Calendar className="mr-2" size={16} />
                            Request Mentorship
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <div className="p-2">
                            <MentorshipRequestForm
                              mentorId={mentor.id}
                              mentorName={mentor.name}
                              onSuccess={() => {
                                checkMentorshipStatus(mentor.id);
                                setIsDialogOpen(false);
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorProfilePage;
