"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Get user role from session
  const userRole = session?.user?.role?.toLowerCase() || "mentee";

  // Navigation items based on user role
  const mentorNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Mentees", href: "/dashboard/my-mentees", icon: Users },
    { name: "Mentorship Requests", href: "/dashboard/requests", icon: Users },
    { name: "Sessions", href: "/dashboard/sessions", icon: Calendar },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: 3,
    },
    { name: "Resources", href: "/dashboard/resources", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const menteeNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Find Mentors", href: "/browse", icon: Search },
    { name: "My Mentors", href: "/dashboard/my-mentors", icon: Users },
    { name: "Sessions", href: "/dashboard/sessions", icon: Calendar },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: 2,
    },
    { name: "My Resources", href: "/dashboard/resources", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const navItems = userRole === "mentor" ? mentorNavItems : menteeNavItems;

  // Show loading state if session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">MentorMatch</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session?.user?.profilePicture || "/placeholder.svg"}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/" className="text-xl font-bold text-primary">
          MentorMatch
        </Link>
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-primary">
                MentorMatch
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto py-4">
              <nav className="px-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      pathname === item.href
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.profilePicture || "/placeholder.svg"}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {pathname === "/dashboard"
                ? "Dashboard"
                : (pathname.split("/").pop() || "").charAt(0).toUpperCase() +
                  (pathname.split("/").pop() || "").slice(1)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session?.user?.profilePicture || "/placeholder.svg"}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
