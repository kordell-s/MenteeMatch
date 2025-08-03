"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            MenteeMatch
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-600 hover:text-gray-900">
              Find Mentors
            </Link>
            <Link
              href="/become-mentor"
              className="text-gray-600 hover:text-gray-900"
            >
              Become a Mentor
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <UserAvatar />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hidden sm:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
