"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  Code,
  Briefcase,
  PenTool,
  LineChart,
  Camera,
  Music,
  Heart,
} from "lucide-react";
import MentorCard from "./MentorCard";
import RecommendedMentors from "./RecommendedMentors";
import { Mentor } from "@/app/types/mentor";
// Mock data for mentors
const mentorData: Mentor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Senior Product Manager",
    company: "Google",
    rating: 4.9,
    reviews: 48,
    availability: "Next available: Tomorrow",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Product Management", "UX", "Career Growth"],
    category: "business",
    bio: "Experienced product leader with 10+ years in tech. I help aspiring PMs break into the field and level up their careers.",
    expertise: ["Product Management", "UX", "Career Growth"],
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Staff Software Engineer",
    company: "Microsoft",
    rating: 4.8,
    reviews: 36,
    availability: "Next available: Today",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["React", "System Design", "Interview Prep"],
    bio: "I help engineers prepare for technical interviews and advance their careers at top tech companies.",
    expertise: ["React", "System Design", "Interview Prep"],
  },
  {
    id: "3",
    name: "Jessica Williams",
    title: "Senior UX Designer",
    company: "Airbnb",
    rating: 5.0,
    reviews: 29,
    tags: [],
    availability: "Next available: Friday",
    bio: "Passionate about creating beautiful, user-centered designs. I help designers build impressive portfolios and land their dream jobs.",
    image: "/placeholder.svg?height=400&width=400",
    expertise: ["UI/UX", "Design Systems", "Portfolio Review"],
    category: "design",
  },
  {
    id: "4",
    name: "David Rodriguez",
    title: "Marketing Director",
    company: "Spotify",
    rating: 4.7,
    reviews: 42,
    availability: "Next available: Monday",
    bio: "Marketing leader specializing in growth and brand strategy. I help marketers develop effective campaigns and advance their careers.",
    image: "/placeholder.svg?height=400&width=400",
    expertise: ["Digital Marketing", "Growth", "Brand Strategy"],
    tags: ["Digital Marketing", "Growth", "Brand Strategy"],
    category: "business",
  },
  {
    id: "5",
    name: "Emily Zhang",
    title: "Data Science Manager",
    company: "Netflix",
    rating: 4.9,
    reviews: 31,
    bio: "Data science leader helping aspiring data scientists master the technical and soft skills needed to excel in this field.",
    expertise: ["Data Science", "Machine Learning", "Python"],
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Data Science", "Machine Learning", "Python"],
    category: "technology",
  },
  {
    id: "6",
    name: "James Wilson",
    title: "Creative Director",
    company: "Adobe",
    rating: 4.8,
    reviews: 27,
    bio: "Award-winning creative director with 15+ years of experience. I help designers develop their creative vision and leadership skills.",
    expertise: ["Graphic Design", "Branding", "Creative Direction"],
    availability: "Next available: Thursday",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Graphic Design", "Branding", "Creative Direction"],
    category: "design",
  },
  {
    id: "7",
    name: "Olivia Martinez",
    title: "Frontend Engineer",
    company: "Shopify",
    rating: 4.9,
    reviews: 34,
    bio: "Frontend specialist passionate about creating beautiful, accessible web experiences. I help developers level up their frontend skills.",
    expertise: ["JavaScript", "React", "CSS"],
    availability: "Next available: Tomorrow",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["JavaScript", "React", "CSS"],
    category: "technology",
  },
  {
    id: "8",
    name: "Robert Kim",
    title: "Product Design Lead",
    company: "Figma",
    bio: "Design leader specializing in product design and design systems. I help designers create impactful, scalable design solutions.",
    expertise: ["Product Design", "Design Systems", "Figma"],
    reviews: 39,
    rating: 4.9,
    availability: "Next available: Wednesday",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Product Design", "Design Systems", "Figma"],
    category: "design",
  },
  {
    id: "9",
    name: "Sophia Lee",
    title: "Startup Advisor",
    bio: "Experienced startup executive and advisor. I help founders navigate growth challenges and fundraising.",
    expertise: ["Startups", "Fundraising", "Strategy"],
    rating: 4.8,
    company: "Y Combinator",
    reviews: 23,
    availability: "Next available: Tuesday",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Startups", "Fundraising", "Strategy"],
    category: "business",
  },
  {
    id: "10",
    name: "Daniel Brown",
    title: "Backend Engineer",
    bio: "Backend specialist with expertise in distributed systems. I help engineers design scalable, reliable backend architectures.",
    expertise: ["Java", "Microservices", "System Design"],
    company: "Amazon",
    rating: 4.7,
    reviews: 28,
    category: "technology",
    image: "/placeholder.svg?height=400&width=400",
    tags: [],
  },
  {
    id: "11",
    name: "Rachel Adams",
    bio: "Content expert helping marketers and writers develop effective content strategies and improve their storytelling skills.",
    expertise: ["Content Marketing", "SEO", "Storytelling"],
    title: "Content Strategist",
    company: "HubSpot",
    rating: 4.9,
    reviews: 32,
    availability: "Next available: Today",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Content Marketing", "SEO", "Storytelling"],
    category: "creative",
  },
  {
    id: "12",
    bio: "Award-winning motion designer with experience at top studios. I help designers bring their work to life through animation.",
    expertise: ["Motion Design", "Animation", "After Effects"],
    name: "Alex Thompson",
    title: "Motion Designer",
    company: "Pixar",
    rating: 5.0,
    reviews: 26,
    availability: "Next available: Friday",
    image: "/placeholder.svg?height=400&width=400",
    tags: ["Motion Design", "Animation", "After Effects"],
    category: "creative",
  },
];

// Categories with icons
const categories = [
  { id: "recommended", name: "Recommended", icon: Star },
  { id: "technology", name: "Technology", icon: Code },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "design", name: "Design", icon: PenTool },
  { id: "marketing", name: "Marketing", icon: LineChart },
  { id: "creative", name: "Creative", icon: Camera },
  { id: "music", name: "Music", icon: Music },
  { id: "health", name: "Health", icon: Heart },
];

export default function MentorBrowser() {
  const [activeCategory, setActiveCategory] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMentors, setFilteredMentors] = useState(mentorData);
  const [sortOption, setSortOption] = useState("recommended");

  // Filter mentors based on active category and search query
  useEffect(() => {
    let result = mentorData;

    // Filter by category if not on recommended tab
    if (activeCategory !== "recommended") {
      result = result.filter((mentor) => mentor.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mentor: Mentor) =>
          (mentor.name && mentor.name.toLowerCase().includes(query)) ||
          (mentor.title ?? "").toLowerCase().includes(query) ||
          (mentor.company ?? "").toLowerCase().includes(query) ||
          mentor.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Sort results
    if (sortOption === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    // For 'recommended', we use the default order

    setFilteredMentors(result);
  }, [activeCategory, searchQuery, sortOption]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Find Your Mentor</h1>
      <p className="text-gray-600 mb-8">
        Browse mentors that match your goals and schedule a session
      </p>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search by name, title, skills..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filters</span>
              <ChevronDown size={16} />
            </Button>
          </div>

          <div className="relative">
            <select
              className="h-10 px-4 py-2 rounded-md border border-input bg-background text-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories tabs */}
      <Tabs
        defaultValue="recommended"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-8"
      >
        <TabsList className="flex overflow-x-auto pb-2 mb-2 space-x-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Icon size={16} />
                <span>{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Recommended tab content */}
        <TabsContent value="recommended" className="mt-6">
          <RecommendedMentors
            mentors={filteredMentors.filter(
              (mentor): mentor is Mentor => 
                !!mentor.image && 
                typeof mentor.availability === 'string'
            ) as Mentor[]}
          />
        </TabsContent>

        {/* Other category tabs */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors
                .filter((mentor): mentor is Mentor => !!mentor.image)
                .map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No mentors found matching your criteria.
                </p>
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
