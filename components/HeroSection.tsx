"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeroSection() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-brand-sky/20 to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-brand-navy">
              Find the perfect mentor to{" "}
              <span className="text-brand-teal">accelerate</span> your growth
            </h1>
            <p className="text-xl text-gray-700 max-w-lg leading-relaxed">
              Connect with industry experts who can guide you through your
              career journey and help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isLoggedIn ? "/browse" : "/login"}>
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto bg-brand-teal hover:bg-brand-navy text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  Find a Mentor
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-semibold transition-all">
                  Become a Mentor
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-brand-gold rounded-full animate-pulse"></span>
              Join over 10,000 professionals already growing with MentorMatch
            </p>
          </div>

          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl ring-4 ring-brand-sky/30">
            <Image
              src="/images/hero.jpg?height=500&width=600"
              alt="Mentorship in action"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
