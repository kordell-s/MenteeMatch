import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mentor } from "@/app/types/mentor";
import { Star, Clock, MessageCircle, Calendar, Bookmark } from "lucide-react";

interface MentorCardProps {
  mentor: Mentor;
  recommended?: boolean;
}

export default function MentorCard({
  mentor,
  recommended = false,
}: MentorCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
        recommended ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <div className="relative">
        {recommended && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-primary text-white">Best Match</Badge>
          </div>
        )}
        <Image
          src={mentor.profilePicture || "/placeholder.svg"}
          alt={mentor.name}
          width={400}
          height={400}
          className="w-full h-48 object-cover"
        />
        <button className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white">
          <Bookmark size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg">{mentor.name}</h3>
            <p className="text-gray-600">{mentor.location}</p>
            <p className="text-gray-500 text-sm">{mentor.company}</p>
          </div>
          <div className="flex items-center">
            <Star className="text-yellow-400 h-4 w-4 mr-1" />
            <span className="font-medium">{mentor.rating}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({mentor.rating} ratings)
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{mentor.bio}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {skill.replaceAll("_", " ")}
            </Badge>
          ))}
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>{mentor.availability}</span>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
