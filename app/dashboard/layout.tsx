"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Get user role from session
  const userRole = session?.user?.role?.toLowerCase() || "mentee";

  // Navigation item type
  type NavItem = {
    name: string;
    href: string;
    icon: any;
    badge?: string | number;
  };

  // Navigation items based on user role
  const mentorNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Mentees", href: "/dashboard/my-mentees", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Edit Profile", href: "/profile", icon: Settings },
  ];

  const menteeNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Mentors", href: "/dashboard/my-mentors", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Edit Profile", href: "/profile", icon: Settings },
  ];

  const navItems = userRole === "mentor" ? mentorNavItems : menteeNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-4 border-brand-teal/20 shadow-lg transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
        >
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b-2 border-brand-sky/30 bg-gradient-to-r from-white to-brand-sky/5 flex-shrink-0">
            <Link href="/" className="group">
              <Logo size="sm" showIcon={true} className="transition-transform group-hover:scale-105" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-md text-brand-teal hover:text-brand-navy hover:bg-brand-sky/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-brand-teal to-brand-navy text-white shadow-md"
                    : "text-brand-navy hover:bg-brand-sky/20 hover:text-brand-teal"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  pathname === item.href ? "text-white" : "text-brand-teal"
                }`} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-brand-orange text-white text-xs shadow-sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="flex-shrink-0 p-4 border-t-2 border-brand-sky/30 bg-gradient-to-r from-brand-sky/10 to-white">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 ring-2 ring-brand-teal ring-offset-2">
                <AvatarImage
                  src={session?.user?.profilePicture || "/placeholder.svg"}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback className="bg-brand-teal text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-navy truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-brand-teal capitalize truncate font-medium">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-md border-b-2 border-brand-teal/30 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-brand-teal hover:text-brand-navy hover:bg-brand-sky/20 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-brand-navy">Dashboard</h1>
              <Button variant="ghost" size="sm" className="p-2 text-brand-teal hover:text-brand-navy hover:bg-brand-sky/20">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
