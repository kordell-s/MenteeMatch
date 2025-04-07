import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Find the perfect mentor to accelerate your growth
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Connect with industry experts who can guide you through your
              career journey and help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Find a Mentor
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Become a Mentor
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Join over 10,000 professionals already growing with MenteeMatch
            </p>
          </div>

          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
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
