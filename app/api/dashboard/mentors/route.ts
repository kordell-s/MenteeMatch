import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can access this endpoint" },
        { status: 403 }
      );
    }

    // Fetch confirmed mentorships for this mentee
    const mentorships = await prisma.mentorship.findMany({
      where: {
        menteeId: user.id,
        status: "ACCEPTED",
      },
      include: {
        mentor: true,
      },
    });

    const mentors = mentorships.map((mentorship) => ({
      id: mentorship.mentor.id,
      name: mentorship.mentor.name,
      title: mentorship.mentor.title,
      bio: mentorship.mentor.bio,
      profilePicture: mentorship.mentor.profilePicture,
      skills: [], // Skills would need separate query if needed
      goals: [], // Goals would need separate query if needed
    }));

    return NextResponse.json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
