import { Button } from "@/components/ui/button";
import MentorCard from "./MentorCard";
import { Mentor } from "@/app/types/mentor";

// Mock user goals and interests
const userGoals = [
  "Career transition to product management",
  "Improve frontend development skills",
  "Prepare for technical interviews",
];

interface RecommendedMentorsProps {
  mentors: Mentor[];
}

export default function RecommendedMentors({
  mentors,
}: RecommendedMentorsProps) {
  // Get top 3 recommended mentors
  const topRecommended = mentors.slice(0, 3);
  // Get remaining mentors
  const otherMentors = mentors.slice(3);

  return (
    <div className="space-y-12">
      {/* Personalized recommendations section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Based on your goals</h2>
          <Button variant="link" className="text-primary">
            Update your goals
          </Button>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Your current goals:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {userGoals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRecommended.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} recommended={true} />
          ))}
        </div>
      </div>

      {/* Recently active mentors */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recently active mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMentors.slice(0, 3).map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>

      {/* Popular in your network */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Popular in your network</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMentors.slice(3, 6).map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </div>
    </div>
  );
}
