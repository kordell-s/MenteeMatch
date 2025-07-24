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
            email: true,
            profilePicture: true,
            availability: true,
            location: true,
            rating: true,
            skills: true,
            languages: true,
            company: true,
            bio: true,
            role: true,
            experienceLevel: true, 
            title: true, 
          }
        },
        // Remove mentorships relation if not needed to simplify the query
      },
    });

    
    const transformedMentors = mentors.map(mentor => ({
      id: mentor.user.id,
      name: mentor.user.name,
      email: mentor.user.email,
      profilePicture: mentor.user.profilePicture,
      availability: mentor.user.availability,
      location: mentor.user.location,
      rating: mentor.user.rating,
      skills: mentor.user.skills,
      experience: mentor.user.experienceLevel, // Map experienceLevel to experience
      languages: mentor.user.languages,
      company: mentor.user.company,
      bio: mentor.user.bio,
      role: mentor.user.role,
      category: mentor.category, // This comes from the Mentor table
      mentor: {
        specialization: mentor.specialization,
        pricing: mentor.pricing,
      },
    }));

    return NextResponse.json(transformedMentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json({error: "Failed to fetch mentors" }, { status: 500 });
  }
}