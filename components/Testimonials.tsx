"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Product Manager at Google",
    image: "/placeholder.svg?height=100&width=100",
    quote:
      "Finding a mentor on MentorMatch completely changed my career trajectory. The guidance I received helped me land my dream job at Google.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer at Microsoft",
    image: "/placeholder.svg?height=100&width=100",
    quote:
      "As someone transitioning into tech, having an experienced mentor made all the difference. The personalized advice was exactly what I needed.",
  },
  {
    id: 3,
    name: "Jessica Williams",
    role: "UX Designer at Airbnb",
    image: "/placeholder.svg?height=100&width=100",
    quote:
      "The mentorship I received through this platform was invaluable. My mentor provided actionable feedback that helped me improve my design portfolio.",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          What our users say
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <Quote className="absolute text-gray-200 h-24 w-24 -top-6 -left-6 opacity-50" />

            <div className="relative z-10">
              <p className="text-xl md:text-2xl text-gray-700 italic mb-8">
                "{testimonials[activeIndex].quote}"
              </p>

              <div className="flex items-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonials[activeIndex].image || "/placeholder.svg"}
                    alt={testimonials[activeIndex].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === activeIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
