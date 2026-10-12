"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  CalendarDays,
  MessageSquare,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Route,
  Inbox,
  Clock,
  LogOut,
} from "lucide-react";
import Wordmark from "@/components/world/Wordmark";
import Person from "@/components/world/Person";

type NavItem = { name: string; href: string; icon: React.ElementType };

const MENTOR_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Requests", href: "/dashboard/requests", icon: Inbox },
  { name: "Mentees", href: "/dashboard/my-mentees", icon: Users },
  { name: "Routes", href: "/dashboard/roadmaps", icon: Route },
  { name: "Sessions", href: "/dashboard/sessions", icon: Clock },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

const MENTEE_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My route", href: "/dashboard/roadmaps", icon: Route },
  { name: "My mentors", href: "/dashboard/my-mentors", icon: Users },
  { name: "Find mentors", href: "/browse", icon: Search },
  { name: "Sessions", href: "/dashboard/sessions", icon: Clock },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/") ||
    (href === "/dashboard/roadmaps" && pathname.startsWith("/dashboard/roadmap/"));
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname() ?? "";
  const isMentor = session?.user?.role === "MENTOR";
  const nav = isMentor ? MENTOR_NAV : MENTEE_NAV;

  useEffect(() => setOpen(false), [pathname]);

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Wordmark tone="chalk" size="sm" href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[8px] p-1.5 text-chalk/60 hover:bg-white/8 hover:text-chalk lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav aria-label="App" className="flex-1 overflow-y-auto px-3 pt-4">
        <ul className="grid gap-0.5">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-colors ${
                    active ? "bg-tape-yellow text-ink" : "text-chalk/70 hover:bg-white/6 hover:text-chalk"
                  }`}
                >
                  <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/8 p-3">
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors ${
            isActive(pathname, "/profile") ? "bg-white/10" : "hover:bg-white/6"
          }`}
        >
          <Person name={session?.user?.name} src={session?.user?.profilePicture} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-chalk">{session?.user?.name ?? " "}</span>
            <span className="block text-xs text-chalk/60">{isMentor ? "Mentor" : "Mentee"}</span>
          </span>
          <Settings className="size-4 text-chalk/50" aria-label="Profile settings" />
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-chalk/60 hover:bg-white/6 hover:text-chalk"
        >
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="panel min-h-[100dvh] lg:flex">
      <aside className="wall sticky top-0 hidden h-[100dvh] w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-wall-deep/70"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="wall absolute inset-y-0 left-0 w-72 shadow-[var(--shadow-lift)]">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="wall sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-1 rounded-[8px] p-2 text-chalk"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-6" />
          </button>
          <Wordmark tone="chalk" size="sm" href="/dashboard" />
          <Link href="/profile" aria-label="Profile">
            <Person name={session?.user?.name} src={session?.user?.profilePicture} size="xs" />
          </Link>
        </header>

        <main id="main" className="mx-auto w-full min-w-0 max-w-[1240px] px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
