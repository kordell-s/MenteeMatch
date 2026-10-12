"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

// Signed-in app screens use the app shell; auth and onboarding screens carry their own header.
const OWN_CHROME = ["/dashboard", "/messages", "/calendar", "/profile", "/login", "/signup", "/onboarding", "/demo"];

export default function ConditionalNavbar() {
  const pathname = usePathname() ?? "/";
  const hidden = OWN_CHROME.some((p) => pathname === p || pathname.startsWith(p + "/"));
  return hidden ? null : <Navbar />;
}
