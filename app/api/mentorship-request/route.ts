import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireMentor } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireMentor(request);
    
    // Only get requests for the authenticated mentor
    const requests = await prisma.mentorshipRequest.findMany({
      where: {
        mentorId: user.id,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            skills: true,
            experienceLevel: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching mentorship requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { mentorId, offeringType, message } = body;

    // Validate that user is a mentee
    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can send requests" },
        { status: 403 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        menteeId: user.id,
        mentorId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Request already exists" },
        { status: 409 }
      );
    }

    const newRequest = await prisma.mentorshipRequest.create({
      data: {
        menteeId: user.id,
        mentorId,
        offeringType,
        message,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating mentorship request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
