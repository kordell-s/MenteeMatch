import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome to MentorMatch!</h1>
            <p className="mt-4 text-gray-600">
              Your account has been created successfully. Let's set up your
              profile to help you get the most out of our platform.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full">
                Complete your profile
              </Button>
            </Link>

            <Link href="/browse">
              <Button variant="outline" size="lg" className="w-full">
                Browse mentors first
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
