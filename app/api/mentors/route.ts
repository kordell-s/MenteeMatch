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
          role: "MENTOR",
          profileComplete: true, // Only show mentors with complete profiles
        }
      }
    });

    console.log(`📋 Found ${mentors.length} mentors in database`);

    // Transform the data to match the expected Mentor type
    const transformedMentors = mentors.map(mentor => {
      const availability = Array.isArray(mentor.user.availability) 
        ? mentor.user.availability 
        : mentor.user.availability ? [mentor.user.availability] : [];
        
      const timeAvailability = Array.isArray(mentor.user.timeAvailability) 
        ? mentor.user.timeAvailability 
        : mentor.user.timeAvailability ? [mentor.user.timeAvailability] : [];

      const hasAvailability = availability.length > 0;
      const hasTimeAvailability = timeAvailability.length > 0;

      const transformed = {
        id: mentor.user.id,
        name: mentor.user.name || "",
        title: mentor.user.title || "",
        email: mentor.user.email,
        profilePicture: mentor.user.profilePicture,
        availability: availability,
        timeAvailability: timeAvailability,
        availabilityStatus: hasAvailability && hasTimeAvailability 
          ? 'Available' 
          : 'No current availability set',
        location: mentor.user.location || "",
        rating: mentor.user.rating || 0,
        skills: Array.isArray(mentor.user.skills) ? mentor.user.skills : [],
        experience: mentor.user.experienceLevel || "ENTRY",
        languages: Array.isArray(mentor.user.languages) ? mentor.user.languages : [],
        company: mentor.user.company || "",
        bio: mentor.user.bio || "",
        role: mentor.user.role,
        category: mentor.category || "OTHER",
        mentor: {
          specialization: Array.isArray(mentor.specialization) ? mentor.specialization : [],
          pricing: mentor.pricing || null,
        },
        joinedDate: mentor.user.createdAt,
      };

      console.log(`📋 Transformed mentor: ${transformed.name}, Photo: ${transformed.profilePicture}`);
      return transformed;
    });

    console.log(`✅ Successfully transformed ${transformedMentors.length} mentors`);
    return NextResponse.json(transformedMentors);
  } catch (error) {
    console.error("❌ Error fetching mentors:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}