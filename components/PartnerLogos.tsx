"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const partners = [
  { id: 1, name: "Google", logo: "/placeholder.svg?height=60&width=120" },
  { id: 2, name: "Microsoft", logo: "/placeholder.svg?height=60&width=120" },
  { id: 3, name: "Amazon", logo: "/placeholder.svg?height=60&width=120" },
  { id: 4, name: "Apple", logo: "/placeholder.svg?height=60&width=120" },
  { id: 5, name: "Meta", logo: "/placeholder.svg?height=60&width=120" },
  { id: 6, name: "Netflix", logo: "/placeholder.svg?height=60&width=120" },
  { id: 7, name: "Spotify", logo: "/placeholder.svg?height=60&width=120" },
  { id: 8, name: "Airbnb", logo: "/placeholder.svg?height=60&width=120" },
];

export default function PartnerLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const distance = 1;

    const scroll = () => {
      if (isHovered) return;

      scrollContainer.scrollLeft += distance;
      scrollAmount += distance;

      // Reset scroll position when all logos have scrolled
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
        scrollAmount = 0;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          Trusted by professionals from top companies
        </h2>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-12 py-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Double the logos to create infinite scroll effect */}
            {[...partners, ...partners].map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="flex-shrink-0">
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
