"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mentor } from "@/app/types/mentor";
import {
  Star,
  Clock,
  Bookmark,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getDefaultAvatar } from "@/lib/avatars";

interface MentorCardProps {
  mentor: Mentor;
  recommended?: boolean;
}

export default function MentorCard({
  mentor,
  recommended = false,
}: MentorCardProps) {
  const router = useRouter();

  const handleViewProfile = () => {
    // Navigate to profile page with mentor ID in URL
    router.push(`/mentor-profile?id=${mentor.id}`);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${
        recommended ? "border-brand-gold ring-2 ring-brand-gold/50" : "border-transparent hover:border-brand-sky"
      }`}
    >
      <div className="relative">
        {/* Profile Image with gender-based avatar */}
        <img
          src={getDefaultAvatar({
            name: mentor.name,
            gender: (mentor as any).gender,
            profilePicture: mentor.profilePicture
          })}
          alt={mentor.name}
          className="w-full h-48 object-cover"
        />
        <button className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-md">
          <Bookmark size={18} className="text-brand-navy" />
        </button>
        {recommended && (
          <div className="absolute top-3 right-3 bg-brand-gold text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            ⭐ Top Match
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-brand-navy">{mentor.name}</h3>
            {mentor.title && (
              <p className="text-brand-teal text-base font-semibold mb-1">
                {mentor.title}
              </p>
            )}
            <p className="text-gray-700 text-sm font-medium mb-1">
              {mentor.company}
            </p>
            <p className="text-gray-600 text-sm">{mentor.location}</p>
          </div>
          <div className="flex items-center bg-brand-gold/10 px-2 py-1 rounded-lg">
            <Star className="text-brand-gold fill-brand-gold h-4 w-4 mr-1" />
            <span className="font-bold text-brand-navy">
              {mentor.rating?.toFixed(1) || "New"}
            </span>
            {mentor.rating && (
              <span className="text-gray-600 text-xs ml-1">
                ({Math.floor(mentor.rating * 10)})
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{mentor.bio}</p>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          {mentor.skills && mentor.skills.length > 0 ? (
            mentor.skills.slice(0, 4).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="font-medium text-xs bg-brand-sky/20 text-brand-navy hover:bg-brand-sky/40 border-none"
              >
                {skill.replaceAll("_", " ")}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">
              No skills listed
            </span>
          )}
          {mentor.skills && mentor.skills.length > 4 && (
            <Badge variant="outline" className="text-xs border-brand-teal text-brand-teal">
              +{mentor.skills.length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0 text-brand-teal" />
          <span className="line-clamp-1">
            {mentor.availability &&
            Array.isArray(mentor.availability) &&
            mentor.availability.length > 0
              ? (mentor.availability as string[])
                  .slice(0, 3)
                  .map(
                    (day: string) => day.charAt(0) + day.slice(1).toLowerCase()
                  )
                  .join(" • ")
              : "Schedule flexible"}
          </span>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleViewProfile} className="w-full bg-brand-teal hover:bg-brand-navy text-white font-semibold shadow-md hover:shadow-lg transition-all">
            <UserRound className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
