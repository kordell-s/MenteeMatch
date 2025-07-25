import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menteeId, mentorId, offeringType, message } = body;

    // Validate required fields
    if (!menteeId || !mentorId || !offeringType || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 20) {
      return NextResponse.json(
        { error: "Message must be at least 20 characters long" },
        { status: 400 }
      );
    }

    // Check if mentee and mentor exist
    const [mentee, mentor] = await Promise.all([
      prisma.user.findUnique({
        where: { id: menteeId },
        select: { id: true, role: true },
      }),
      prisma.user.findUnique({
        where: { id: mentorId },
        select: { id: true, role: true },
      }),
    ]);

    if (!mentee) {
      return NextResponse.json(
        { error: "Mentee not found" },
        { status: 404 }
      );
    }

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }

    if (mentee.role !== "MENTEE") {
      return NextResponse.json(
        { error: "User is not a mentee" },
        { status: 400 }
      );
    }

    if (mentor.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Target user is not a mentor" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request between these users
    const existingRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        menteeId,
        mentorId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request with this mentor" },
        { status: 400 }
      );
    }

    // Check if there's already an active mentorship
    const existingMentorship = await prisma.mentorship.findFirst({
      where: {
        menteeId,
        mentorId,
      },
    });

    if (existingMentorship) {
      return NextResponse.json(
        { error: "You already have an active mentorship with this mentor" },
        { status: 400 }
      );
    }

    // Create the mentorship request
    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        menteeId,
        mentorId,
        offeringType,
        message: message.trim(),
        status: "PENDING",
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: mentorshipRequest,
    });
  } catch (error) {
    console.error("Error creating mentorship request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId");
    const menteeId = searchParams.get("menteeId");

    if (!mentorId && !menteeId) {
      return NextResponse.json(
        { error: "Either mentorId or menteeId is required" },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    if (mentorId) {
      whereClause.mentorId = mentorId;
    }

    if (menteeId) {
      whereClause.menteeId = menteeId;
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where: whereClause,
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
