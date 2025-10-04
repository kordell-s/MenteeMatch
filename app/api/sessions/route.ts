import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let sessions;

    if (role === "MENTOR" || user.role === "MENTOR") {
      // Fetch sessions where user is the mentor
      sessions = await prisma.session.findMany({
        where: {
          mentorId: user.id,
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
              profilePicture: true,
            },
          },
        },
        orderBy: [
          { status: "asc" }, // Pending first
          { date: "desc" },  // Then by date
        ],
      });
    } else {
      // Fetch sessions where user is the mentee
      sessions = await prisma.session.findMany({
        where: {
          menteeId: user.id,
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
              profilePicture: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { date: "desc" },
        ],
      });
    }

    // Transform the sessions to include formatted data
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      title: session.title || "Mentoring Session",
      date: session.date.toISOString(),
      time: session.time || "Time TBD",
      duration: session.duration || 60,
      status: session.status,
      description: session.description,
      mentor: session.mentor,
      mentee: session.mentee,
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      mentorId,
      menteeId,
      date,
      time,
      duration,
      title,
      description,
      offeringType,
    } = await req.json();

    // Verify that the user is either the mentor or mentee
    if (user.id !== mentorId && user.id !== menteeId) {
      return NextResponse.json(
        { error: "Unauthorized to create this session" },
        { status: 403 }
      );
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        mentorId,
        menteeId,
        date: new Date(date),
        time,
        duration,
        title,
        description,
        // offeringType,
        status: "PENDING",
      },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    return NextResponse.json({
      id: session.id,
      title: session.title,
      date: session.date.toISOString(),
      time: session.time,
      duration: session.duration,
      status: session.status,
      description: session.description,
      // offeringType: session.offeringType,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
