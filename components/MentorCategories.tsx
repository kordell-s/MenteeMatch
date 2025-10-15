"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const categoriesConfig = [
  {
    key: "TECHNOLOGY",
    name: "Technology",
    description:
      "Software engineering, data science, product management, and more",
    image: "/images/tech.jpg?height=300&width=400",
  },
  {
    key: "DESIGN",
    name: "Design",
    description: "UX/UI design, graphic design, product design, and more",
    image: "/images/design.jpg?height=300&width=400",
  },
  {
    key: "BUSINESS",
    name: "Business",
    description: "Marketing, entrepreneurship, finance, and more",
    image: "/images/business.jpg?height=300&width=400",
  },
  {
    key: "CREATIVE",
    name: "Creative",
    description: "Writing, photography, filmmaking, and more",
    image: "/images/creative.jpg?height=300&width=400",
  },
];

export default function MentorCategories() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [mentorCounts, setMentorCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentorCounts() {
      try {
        const response = await fetch("/api/mentor-counts");
        if (response.ok) {
          const data = await response.json();
          setMentorCounts(data);
        }
      } catch (error) {
        console.error("Error fetching mentor counts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMentorCounts();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-orange-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Explore mentors by{" "}
            <span className="text-brand-teal">field</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Find experienced professionals in your industry who can help you
            grow and succeed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoriesConfig.map((category) => (
            <div
              key={category.key}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-brand-teal"
            >
              <div className="relative h-48">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-brand-navy">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">
                    {loading ? (
                      <span className="inline-block w-16 h-4 bg-brand-sky/30 rounded animate-pulse"></span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="text-brand-teal font-bold">{mentorCounts[category.key] || 0}</span>
                        <span>mentors</span>
                      </span>
                    )}
                  </span>
                  <Link href={isLoggedIn ? `/browse?category=${category.key}` : "/login"}>
                    <Button variant="outline" size="sm" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white font-semibold transition-all">
                      Explore
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={isLoggedIn ? "/browse" : "/login"}>
            <Button size="lg" className="px-8 bg-brand-orange hover:bg-brand-gold text-white font-semibold shadow-lg hover:shadow-xl transition-all">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
