import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome to your dashboard! This is where you'll manage your mentorship
        journey.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Find a Mentor</h2>
          <p className="text-gray-600 mb-4">
            Browse mentors that match your goals and interests.
          </p>
          <Link href="/browse">
            <Button>Browse Mentors</Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          <p className="text-gray-600 mb-4">
            You don't have any upcoming sessions scheduled.
          </p>
          <Link href="/browse">
            <Button variant="outline">Book a Session</Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-4">
            Add more details to your profile to get better mentor matches.
          </p>
          <Link href="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        <p className="text-gray-600 mb-4">
          Based on your goals, we think these resources might help you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              Product Management Fundamentals
            </h3>
            <p className="text-sm text-gray-500 mb-2">Free course • 2 hours</p>
            <Button variant="link" className="p-0">
              View Course
            </Button>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Frontend Development Roadmap</h3>
            <p className="text-sm text-gray-500 mb-2">Guide • 15 min read</p>
            <Button variant="link" className="p-0">
              Read Guide
            </Button>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              Technical Interview Preparation
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Workshop • Next Tuesday
            </p>
            <Button variant="link" className="p-0">
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
