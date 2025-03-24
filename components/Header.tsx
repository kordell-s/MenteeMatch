import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          MentorMatch
        </Link>
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link
                href="/browse"
                className="text-gray-600 hover:text-gray-900"
              >
                Browse
              </Link>
            </li>
            <li>
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Button variant="outline">Sign In</Button>
            </li>
            <li>
              <Button>Join as Mentor</Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
