import Link from "next/link";
import Wordmark from "@/components/world/Wordmark";

const LINKS = [
  { label: "Mentors", href: "/browse" },
  { label: "How it works", href: "/#how" },
  { label: "Become a mentor", href: "/signup?role=mentor" },
  { label: "Sign in", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="wall border-t border-white/8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Wordmark tone="chalk" size="sm" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-chalk/70 hover:text-chalk">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-chalk/55">© {new Date().getFullYear()} MentorMatch</p>
      </div>
    </footer>
  );
}
