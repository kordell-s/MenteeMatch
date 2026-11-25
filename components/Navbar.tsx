"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Wordmark from "@/components/world/Wordmark";
import Person from "@/components/world/Person";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onWall = pathname === "/";
  const authed = status === "authenticated";

  const tone = onWall
    ? "bg-wall/92 text-chalk border-white/8"
    : "bg-panel/92 text-ink border-ink/8";
  const link = onWall
    ? "text-chalk/80 hover:text-chalk"
    : "text-ink-soft hover:text-ink";

  const links = authed
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/browse", label: "Mentors" },
        { href: "/messages", label: "Messages" },
      ]
    : [
        { href: "/browse", label: "Mentors" },
        { href: "/#how", label: "How it works" },
      ];

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${tone}`}>
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8"
      >
        <Wordmark tone={onWall ? "chalk" : "ink"} />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[15px] font-medium transition-colors ${link}`}
            >
              {l.label}
            </Link>
          ))}

          {authed ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-tape-blue"
                aria-label="Account menu"
              >
                <Person
                  src={session?.user?.profilePicture}
                  name={session?.user?.name}
                  size="sm"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={10}
                  className="z-50 min-w-52 rounded-[12px] border border-ink/10 bg-card p-1.5 text-ink shadow-[var(--shadow-lift)]"
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{session?.user?.name}</p>
                    <p className="text-xs text-ink-soft">{session?.user?.email}</p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-ink/8" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm outline-none data-[highlighted]:bg-ink/5"
                    >
                      <User className="size-4" /> Profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => signOut({ callbackUrl: "/" })}
                    className="flex cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2 text-sm outline-none data-[highlighted]:bg-ink/5"
                  >
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <>
              <Link href="/login" className={`text-[15px] font-medium ${link}`}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-[10px] bg-tape-yellow px-4 text-sm font-semibold text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-[#ffdb63]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`-mr-2 rounded-[10px] p-2 md:hidden ${link}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-current/10 px-4 pb-5 pt-2 md:hidden">
          <ul className="grid gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-[10px] px-3 py-3 text-base font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {authed ? (
              <>
                <li>
                  <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-[10px] px-3 py-3 text-base font-medium">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full rounded-[10px] px-3 py-3 text-left text-base font-medium"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" onClick={() => setOpen(false)} className="block rounded-[10px] px-3 py-3 text-base font-medium">
                    Sign in
                  </Link>
                </li>
                <li className="pt-2">
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center justify-center rounded-[10px] bg-tape-yellow text-base font-semibold text-ink"
                  >
                    Get started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
