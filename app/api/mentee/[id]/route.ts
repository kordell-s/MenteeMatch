import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);

    // Verify that the requesting user is a mentor
    if (user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can view mentee profiles" },
        { status: 403 }
      );
    }

    const menteeId = params.id;

    // Verify that there's either an active mentorship OR a mentorship request
    // between this mentor and mentee
    const [activeMentorship, mentorshipRequest] = await Promise.all([
      prisma.mentorship.findFirst({
        where: {
          menteeId: menteeId,
          mentorId: user.id,
        },
      }),
      prisma.mentorshipRequest.findFirst({
        where: {
          menteeId: menteeId,
          mentorId: user.id,
        },
      }),
    ]);

    // Allow access if there's either an active mentorship or a request (any status)
    if (!activeMentorship && !mentorshipRequest) {
      return NextResponse.json(
        { error: "No relationship found between you and this mentee" },
        { status: 403 }
      );
    }

    // Fetch the mentee's profile
    const menteeProfile = await prisma.user.findUnique({
      where: { id: menteeId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        skills: true,
        location: true,
        company: true,
        title: true,
        experienceLevel: true,
        role: true,
        school: true,
        languages: true,
        mentee: {
          select: {
            goals: true,
            detailedGoals: true,
            rating: true,
          },
        },
      },
    });

    if (!menteeProfile) {
      return NextResponse.json(
        { error: "Mentee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(menteeProfile);
  } catch (error) {
    console.error("Error fetching mentee profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentee profile" },
      { status: 500 }
    );
  }
}
