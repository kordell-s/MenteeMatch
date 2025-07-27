import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const mentors = await prisma.mentor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            title: true, 
            email: true,
            profilePicture: true,
            availability: true,
            timeAvailability: true,
            location: true,
            rating: true,
            skills: true,
            languages: true,
            company: true,
            bio: true,
            role: true,
            experienceLevel: true,
            createdAt: true,
          }
        },
      },
      where: {
        user: {
          role: "MENTOR" // Ensure we only get users with MENTOR role
        }
      }
    }) as Array<{
      userId: string;
      specialization: string[];
      pricing: number | null;
      category: any;
      user: {
        id: string;
        name: string | null;
        title: string | null;
        email: string;
        profilePicture: string | null;
        availability: any;
        timeAvailability: any;
        location: string | null;
        rating: number | null;
        skills: any;
        languages: any;
        company: string | null;
        bio: string | null;
        role: string;
        experienceLevel: string | null;
        createdAt: Date;
      };
    }>;

    // Transform the data to match the expected Mentor type
    const transformedMentors = mentors.map(mentor => {
      const hasAvailability = mentor.user.availability && mentor.user.availability.length > 0;
      const hasTimeAvailability = mentor.user.timeAvailability && mentor.user.timeAvailability.length > 0;

      return {
        id: mentor.user.id,
        name: mentor.user.name || "",
        title: mentor.user.title || "",
        email: mentor.user.email,
        profilePicture: mentor.user.profilePicture,
        availability: Array.isArray(mentor.user.availability) 
          ? mentor.user.availability 
          : mentor.user.availability ? [mentor.user.availability] : [],
        timeAvailability: Array.isArray(mentor.user.timeAvailability) 
          ? mentor.user.timeAvailability 
          : mentor.user.timeAvailability ? [mentor.user.timeAvailability] : [],
        availabilityStatus: hasAvailability && hasTimeAvailability 
          ? 'Available' 
          : 'No current availability set',
        location: mentor.user.location || "",
        rating: mentor.user.rating || 0,
        skills: Array.isArray(mentor.user.skills) ? mentor.user.skills : [],
        experience: mentor.user.experienceLevel || "BEGINNER",
        languages: Array.isArray(mentor.user.languages) ? mentor.user.languages : [],
        company: mentor.user.company || "",
        bio: mentor.user.bio || "",
        role: mentor.user.role,
        category: mentor.category || "TECHNOLOGY", // Default category if not set
        mentor: {
          specialization: Array.isArray(mentor.specialization) ? mentor.specialization : [],
          pricing: mentor.pricing || "",
        },
        // Additional fields that might be needed
        joinedDate: mentor.user.createdAt,
      };
    });

    console.log(`Successfully fetched ${transformedMentors.length} mentors`);
    return NextResponse.json(transformedMentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}