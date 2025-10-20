import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/mentors/[mentorId] - Get a specific mentor by ID (full profile)
export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    const { mentorId } = params;

    if (!mentorId) {
      return NextResponse.json(
        { error: "Mentor ID is required" },
        { status: 400 }
      );
    }

    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
        role: "MENTOR",
      },
      include: {
        mentor: true,
      },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Format the response to match the Mentor type
    const formattedMentor = {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      title: mentor.title || "",
      profilePicture: mentor.profilePicture,
      bio: mentor.bio,
      company: mentor.company,
      school: mentor.school,
      location: mentor.location,
      skills: mentor.skills,
      experience: [], // You might want to add this field to your schema
      languages: mentor.languages,
      rating: mentor.rating,
      verified: mentor.verified,
      experienceLevel: mentor.experienceLevel,
      availability: mentor.availability,
      role: mentor.role,
      category: mentor.mentor?.category || "OTHER",
      createdAt: mentor.createdAt,
      mentor: {
        specialization: mentor.mentor?.specialization || [],
      },
    };

    return NextResponse.json(formattedMentor);
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor" },
      { status: 500 }
    );
  }
}
