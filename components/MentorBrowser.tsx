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
  const [mentorData, setMentorData] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedMentors, setRecommendedMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [sortOption, setSortOption] = useState("recommended");
  const userId = "3459d90e-8bd8-43f2-9b17-b40b16625668"; // Alex James (mentee)

  // Fetch mentor data from API
  useEffect(() => {
    async function fetchMentors() {
      try {
        setError(null);
        // 1. Get all mentors
        const res = await fetch("/api/mentors");
        if (!res.ok) {
          throw new Error(`Failed to fetch mentors: ${res.status}`);
        }
        const data = await res.json();
        const mentors = Array.isArray(data) ? data : [];

        // Debug: Log the full structure of the first mentor
        console.log("Raw API response:", data);
        console.log("First mentor structure:", mentors[0]);
        console.log(
          "First mentor keys:",
          mentors[0] ? Object.keys(mentors[0]) : "No mentors"
        );

        setMentorData(mentors);

        // 2. Get AI-matched mentors
        try {
          const matchRes = await fetch("/api/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menteeId: userId }),
          });

          if (matchRes.ok) {
            const matched = await matchRes.json();
            if (Array.isArray(matched)) {
              const recommended = matched
                .map((match: { mentorId: string }) =>
                  mentors.find((m: Mentor) => m.id === match.mentorId)
                )
                .filter(Boolean);
              setRecommendedMentors(recommended);
            } else {
              console.warn("Match API returned non-array:", matched);
              setRecommendedMentors([]);
            }
          } else {
            console.warn("Match API failed:", matchRes.status);
            setRecommendedMentors([]);
          }
        } catch (matchError) {
          console.warn("Match API error:", matchError);
          setRecommendedMentors([]);
        }
      } catch (err) {
        console.error("Error fetching mentors:", err);
        setError(err instanceof Error ? err.message : "Failed to load mentors");
        setMentorData([]);
        setRecommendedMentors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMentors();
  }, []);

  // Filter mentors based on active category and search query
  useEffect(() => {
    let result = mentorData;

    console.log("Filtering - activeCategory:", activeCategory);
    console.log("Total mentors:", mentorData.length);
    console.log(
      "Sample mentor categories:",
      mentorData
        .slice(0, 3)
        .map((m) => ({ name: m.name, category: m.category }))
    );

    if (activeCategory === "recommended") {
      // For recommended tab, use recommended mentors as base
      result =
        recommendedMentors.length > 0
          ? recommendedMentors
          : mentorData.slice(0, 6);
    } else {
      // Map frontend category IDs to database enum values
      const categoryMapping: { [key: string]: string } = {
        technology: "TECHNOLOGY",
        business: "BUSINESS",
        design: "DESIGN",
        marketing: "MARKETING",
        creative: "CREATIVE",
        music: "MUSIC",
        health: "HEALTH",
      };

      const dbCategory = categoryMapping[activeCategory];
      console.log("Mapped category:", activeCategory, "->", dbCategory);

      if (dbCategory) {
        result = mentorData.filter((mentor) => mentor.category === dbCategory);
        console.log("Filtered mentors for", dbCategory, ":", result.length);
        console.log("Available categories in data:", [
          ...new Set(mentorData.map((m) => m.category)),
        ]);
      } else {
        // Fallback - if category not found, show all mentors
        console.warn(`Unknown category: ${activeCategory}`);
        result = mentorData;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mentor: Mentor) =>
          mentor.name?.toLowerCase().includes(query) ||
          mentor.company?.toLowerCase().includes(query) ||
          mentor.skills?.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    // Sort results
    if (sortOption === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    console.log("Final filtered mentors:", result.length);
    setFilteredMentors(result);
  }, [mentorData, activeCategory, searchQuery, sortOption, recommendedMentors]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading mentors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

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
          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          ) : (
            <RecommendedMentors mentors={recommendedMentors} />
          )}

          {searchQuery && filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No mentors found matching your search.
              </p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Other category tabs */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
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
