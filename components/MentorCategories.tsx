import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: 1,
    name: "Technology",
    description:
      "Software engineering, data science, product management, and more",
    image: "/placeholder.svg?height=300&width=400",
    mentorCount: 245,
  },
  {
    id: 2,
    name: "Design",
    description: "UX/UI design, graphic design, product design, and more",
    image: "/placeholder.svg?height=300&width=400",
    mentorCount: 187,
  },
  {
    id: 3,
    name: "Business",
    description: "Marketing, entrepreneurship, finance, and more",
    image: "/placeholder.svg?height=300&width=400",
    mentorCount: 203,
  },
  {
    id: 4,
    name: "Creative",
    description: "Writing, photography, filmmaking, and more",
    image: "/placeholder.svg?height=300&width=400",
    mentorCount: 156,
  },
];

export default function MentorCategories() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore mentors by field
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find experienced professionals in your industry who can help you
            grow and succeed
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105"
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
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.mentorCount} mentors
                  </span>
                  <Link href={`/category/${category.id}`}>
                    <Button variant="outline" size="sm">
                      Explore
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="px-8">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
}
