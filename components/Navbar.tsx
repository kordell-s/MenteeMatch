"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import React from "react";

export default function Navbar() {
  const { data: session, status } = useSession();

  // Get user initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      // Sign out with NextAuth
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if signOut fails
      window.location.href = "/";
    }
  };

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
            {session?.user && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.profilePicture || undefined}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(session.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
