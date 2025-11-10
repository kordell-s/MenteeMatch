"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  Code,
  Briefcase,
  PenTool,
  LineChart,
  Camera,
  Music,
  Heart,
} from "lucide-react";
import MentorCard from "./MentorCard";
import MentorCardSkeleton from "./MentorCardSkeleton";
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
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [mentorData, setMentorData] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("technology"); // Default to first category, not recommendations
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedMatchData, setRecommendedMatchData] = useState<any[]>([]); // Full match data with scores
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [sortOption, setSortOption] = useState("recommended");

  // Use session user ID instead of hardcoded ID
  const userId = session?.user?.id;

  // Handle category from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get("category");
    if (categoryParam) {
      // Map database enum to frontend category ID
      const categoryMapping: { [key: string]: string } = {
        TECHNOLOGY: "technology",
        BUSINESS: "business",
        DESIGN: "design",
        MARKETING: "marketing",
        CREATIVE: "creative",
        MUSIC: "music",
        HEALTH: "health",
      };

      const frontendCategory = categoryMapping[categoryParam];
      if (frontendCategory) {
        setActiveCategory(frontendCategory);
      }
    }
  }, [searchParams]);

  // Phase 1: Fetch all mentors FIRST (fast, immediate display)
  useEffect(() => {
    async function fetchMentors() {
      try {
        setError(null);
        console.log("🚀 Phase 1: Fetching all mentors...");

        const res = await fetch("/api/mentors");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch mentors (${res.status}): ${errorText}`
          );
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected array of mentors");
        }

        const validMentors = data.filter((mentor) => {
          const isValid =
            mentor &&
            typeof mentor.id === "string" &&
            typeof mentor.name === "string" &&
            mentor.name.trim() !== "";

          if (!isValid) {
            console.warn("Invalid mentor data:", mentor);
          }
          return isValid;
        });

        console.log(
          `✅ Phase 1 Complete: ${validMentors.length} mentors loaded`
        );

        setMentorData(validMentors);
        setLoading(false); // ⚡ Immediately show mentors!
      } catch (err) {
        console.error("Error fetching mentors:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load mentors";
        setError(errorMessage);
        setMentorData([]);
        setLoading(false);
      }
    }

    fetchMentors();
  }, []); // Only run once on mount

  // Phase 2: Fetch AI recommendations ASYNCHRONOUSLY (in background)
  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId || mentorData.length === 0) {
        console.log("⏭️  Skipping recommendations: No user or mentors");
        return;
      }

      try {
        setLoadingRecommendations(true);
        console.log("🧠 Phase 2: Fetching AI recommendations in background...");

        const matchRes = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menteeId: userId }),
        });

        if (matchRes.ok) {
          const matchData = await matchRes.json();

          // Store the full match data structure (with scores, algorithm info, etc.)
          if (matchData.success && Array.isArray(matchData.matches)) {
            console.log(`✅ Phase 2 Complete: ${matchData.matches.length} recommendations loaded`);
            setRecommendedMatchData(matchData.matches);
          } else {
            console.warn("Match API returned unexpected format:", matchData);
            setRecommendedMatchData([]);
          }
        } else {
          const errorText = await matchRes.text();
          console.warn(`Match API failed (${matchRes.status}):`, errorText);
          setRecommendedMatchData([]);
        }
      } catch (matchError) {
        console.warn("AI recommendations error:", matchError);
        setRecommendedMatchData([]);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    // Only fetch recommendations after mentors are loaded
    if (mentorData.length > 0 && userId) {
      fetchRecommendations();
    }
  }, [userId, mentorData.length]); // Trigger when user or mentor data changes

  // Filter mentors based on active category and search query
  useEffect(() => {
    let result = mentorData;

    console.log("Filtering mentors:", {
      activeCategory,
      totalMentors: mentorData.length,
      searchQuery: searchQuery || "none",
      recommendedCount: recommendedMatchData.length,
    });

    if (activeCategory === "recommended") {
      // For recommended tab, extract mentors from match data
      if (recommendedMatchData.length > 0) {
        result = recommendedMatchData
          .map((match: any) => mentorData.find((m: Mentor) => m.id === match.mentorId))
          .filter((m): m is Mentor => m !== undefined);
      } else {
        result = mentorData.slice(0, 6);
      }
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

      if (dbCategory) {
        result = mentorData.filter((mentor) => mentor.category === dbCategory);
        console.log(
          `Filtered ${result.length} mentors for category ${dbCategory}`
        );
      } else {
        console.warn(
          `Unknown category: ${activeCategory}, showing all mentors`
        );
        result = mentorData;
      }
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (mentor: Mentor) =>
          mentor.name?.toLowerCase().includes(query) ||
          mentor.title?.toLowerCase().includes(query) ||
          mentor.company?.toLowerCase().includes(query) ||
          mentor.skills?.some((skill) => skill.toLowerCase().includes(query)) ||
          mentor.bio?.toLowerCase().includes(query)
      );
      console.log(`Search filtered to ${result.length} mentors`);
    }

    // Sort results
    if (sortOption === "rating") {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    setFilteredMentors(result);
  }, [mentorData, activeCategory, searchQuery, sortOption, recommendedMatchData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Mentor</h1>
        <p className="text-gray-600 mb-8">
          Browse mentors that match your goals and schedule a session
        </p>

        {/* Search and filter bar skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Categories tabs skeleton */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
          ))}
        </div>

        {/* Loading mentor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Unable to Load Mentors</h2>
          <p className="text-red-500 mb-4">Error: {error}</p>
          <p className="text-gray-600 mb-4">
            There seems to be an issue with the mentors API. Please try again or
            contact support if the problem persists.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => setError(null)}>
              Continue Without Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message when no mentors are available
  if (!loading && mentorData.length === 0 && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No Mentors Available</h2>
          <p className="text-gray-600 mb-4">
            No mentors are currently available. This might be due to:
          </p>
          <ul className="text-gray-600 mb-4 list-disc list-inside">
            <li>No mentors have registered yet</li>
            <li>Database connection issues</li>
            <li>Mentors are currently inactive</li>
          </ul>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Find Your Mentor</h1>
      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
        Browse mentors that match your goals and schedule a session
      </p>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search by name, title, skills..."
            className="pl-10 h-10 md:h-11 text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            className="w-full sm:w-auto h-10 md:h-11 px-3 md:px-4 py-2 rounded-md border border-input bg-background text-sm md:text-base"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Categories tabs */}
      <Tabs
        defaultValue="recommended"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6 md:mb-8"
      >
        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="flex overflow-x-auto overflow-y-hidden pb-2 mb-2 gap-2 w-full justify-start hide-scrollbar touch-pan-x snap-x snap-mandatory">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0 snap-start min-w-fit"
                >
                  <Icon size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span>{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {/* Scroll indicator for mobile */}
          <div className="md:hidden absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Recommended tab content */}
        <TabsContent value="recommended" className="mt-6">
          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          ) : (
            <RecommendedMentors
              mentors={recommendedMatchData}
              allMentors={mentorData}
              loading={loadingRecommendations}
            />
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
