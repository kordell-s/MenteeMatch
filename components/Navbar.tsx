"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    // Use signOut with callbackUrl to automatically redirect and refresh
    await signOut({ callbackUrl: "/", redirect: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-brand-teal/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Logo size="md" showIcon={true} className="transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-brand-navy hover:text-brand-teal transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/browse"
                  className="text-brand-navy hover:text-brand-teal transition-colors font-medium"
                >
                  Browse Mentors
                </Link>

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-brand-navy hover:text-brand-teal transition-colors focus:outline-none"
                  >
                    <Avatar className="w-8 h-8 ring-2 ring-brand-teal">
                      <AvatarImage
                        src={
                          session?.user?.profilePicture || "/placeholder.svg"
                        }
                        alt={session?.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-brand-teal text-white text-sm font-semibold">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-brand-sky">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-brand-navy hover:bg-brand-sky/20 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        View Profile
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-brand-navy hover:bg-brand-sky/20 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-brand-navy hover:bg-brand-sky/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/browse"
                  className="text-brand-navy hover:text-brand-teal transition-colors font-medium"
                >
                  Browse Mentors
                </Link>
                <Link
                  href="/login"
                  className="text-brand-navy hover:text-brand-teal transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                >
                  <Button className="bg-brand-orange hover:bg-brand-gold text-white font-semibold">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-navy hover:text-brand-teal transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-brand-sky">
              {status === "authenticated" ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2 border-b border-brand-sky mb-2">
                    <Avatar className="w-10 h-10 ring-2 ring-brand-teal">
                      <AvatarImage
                        src={
                          session?.user?.profilePicture || "/placeholder.svg"
                        }
                        alt={session?.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-brand-teal text-white font-semibold">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-brand-navy">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/browse"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Browse Mentors
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/browse"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Browse Mentors
                  </Link>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 text-brand-navy hover:bg-brand-sky/20 rounded transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
