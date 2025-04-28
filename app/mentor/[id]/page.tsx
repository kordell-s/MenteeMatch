import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

type Params = {
  params: {
    id: string;
  };
};

export default async function MentorProfilePage({ params }: Params) {
  const mentor = await prisma.user.findUnique({
    where: { id: params.id },
    include: { mentor: true },
  });

  if (!mentor || mentor.role !== "MENTOR") {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Link
          href="/browse"
          className="inline-flex items-center text-gray-600 mb-6 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to browse
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative h-64 md:h-full">
                <Image
                  src={mentor.profilePicture || "https://placehold.co/400x400"}
                  alt={mentor.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="p-6 md:p-8 md:w-2/3 lg:w-3/4">
              <div className="flex flex-wrap items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
                  <p className="text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {mentor.company}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                  <Star className="text-yellow-400 w-5 h-5 mr-1" />
                  <span className="font-bold text-lg">{mentor.rating}</span>
                  <span className="text-gray-500 ml-1">
                    ({mentor.rating} rating)
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-2">Specialization</h2>
              <div className="prose max-w-none">
                <p className="mb-4">
                  {mentor.mentor?.specialization ||
                    "No specialization provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {mentor.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium">{mentor.availability}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Session Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Session
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="about">
            <TabsList className="p-0 border-b rounded-none">
              <TabsTrigger value="about" className="rounded-none py-4 px-6">
                About
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none py-4 px-6">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-none py-4 px-6">
                Sessions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">
                About {mentor.name}
              </h2>
              <div className="prose max-w-none">
                <p className="mb-4">{mentor.bio}</p>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {mentor.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="px-4 py-1.5">
                    {skill}
                  </Badge>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Languages</h3>
              <div className="flex flex-wrap gap-4 mb-8">
                <div>
                  <p className="font-medium">{mentor.languages}</p>
                  <p className="text-sm text-gray-500">Native or Bilingual</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Reviews ({mentor.rating} ratings)
                </h2>
                <div className="flex items-center">
                  <Star className="text-yellow-400 w-5 h-5 mr-1" />
                  <span className="font-bold text-lg">{mentor.rating}</span>
                  <span className="text-gray-500 ml-1">average rating</span>
                </div>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">Jane Smith</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 5 ? "text-yellow-400" : "text-gray-300"
                            }`}
                            fill={i < 5 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">2 months ago</p>
                    <p className="text-gray-700">
                      {mentor.name} was incredibly helpful in guiding me through
                      my career transition. Their advice was practical and
                      tailored to my specific situation. I highly recommend
                      booking a session!
                    </p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-4 w-full">
                Load More Reviews
              </Button>
            </TabsContent>

            <TabsContent value="sessions" className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Session Offerings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    1:1 Career Coaching
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Personalized guidance to help you navigate your career path,
                    overcome challenges, and achieve your professional goals.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-500">60 minutes</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">Book This Session</Button>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    Resume & Portfolio Review
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get expert feedback on your resume, portfolio, or LinkedIn
                    profile to stand out to recruiters and hiring managers.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-500">45 minutes</span>
                    </div>
                    <div className="font-bold"></div>
                  </div>
                  <Button className="w-full mt-4">Book This Session</Button>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">Mock Interview</h3>
                  <p className="text-gray-600 mb-4">
                    Practice your interview skills with realistic scenarios and
                    receive constructive feedback to improve your performance.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-500">90 minutes</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">Book This Session</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
