import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId } = params;
    const body = await request.json();
    const { scheduledDate, mentorNotes, createSession } = body;

    // Validation
    if (!scheduledDate) {
      return NextResponse.json(
        { error: "scheduledDate is required" },
        { status: 400 }
      );
    }

    // Verify milestone exists and user has access
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        roadmap: {
          include: {
            mentorship: true,
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const isMentor = milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to create check-in for this milestone" },
        { status: 403 }
      );
    }

    // Create check-in with optional session
    const result = await prisma.$transaction(async (tx) => {
      let sessionId = null;

      // If createSession is true, create a session linked to this check-in
      if (createSession) {
        const session = await tx.session.create({
          data: {
            mentorId: milestone.roadmap.mentorship.mentorId,
            menteeId: milestone.roadmap.mentorship.menteeId,
            date: new Date(scheduledDate),
            time: new Date(scheduledDate).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: 60, // Default 1 hour
            title: `Check-in: ${milestone.title}`,
            description: `Check-in meeting for milestone: ${milestone.title}`,
            status: "PENDING",
          },
        });
        sessionId = session.id;
      }

      // Create the check-in
      const checkIn = await tx.checkIn.create({
        data: {
          milestoneId,
          scheduledDate: new Date(scheduledDate),
          mentorNotes: mentorNotes || null,
          status: "SCHEDULED",
          sessionId,
        },
        include: {
          session: true,
          milestone: {
            include: {
              roadmap: {
                include: {
                  mentorship: {
                    include: {
                      mentor: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                      mentee: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return checkIn;
    });

    return NextResponse.json({
      message: "Check-in scheduled successfully",
      checkIn: result,
    });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
