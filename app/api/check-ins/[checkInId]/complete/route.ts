import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { checkInId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkInId } = params;
    const body = await request.json();
    const { mentorNotes, menteeNotes } = body;

    // Check if check-in exists
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: {
        milestone: {
          include: {
            roadmap: {
              include: {
                mentorship: true,
              },
            },
          },
        },
        session: true,
      },
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    const isMentor = checkIn.milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = checkIn.milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to complete this check-in" },
        { status: 403 }
      );
    }

    // Complete check-in with notes
    const updateData: any = {
      status: "COMPLETED",
      completedDate: new Date(),
    };

    if (isMentor && mentorNotes) {
      updateData.mentorNotes = mentorNotes;
    }

    if (isMentee && menteeNotes) {
      updateData.menteeNotes = menteeNotes;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update check-in
      const updatedCheckIn = await tx.checkIn.update({
        where: { id: checkInId },
        data: updateData,
        include: {
          session: true,
          milestone: true,
        },
      });

      // If there's a linked session, mark it as completed too
      if (checkIn.sessionId) {
        await tx.session.update({
          where: { id: checkIn.sessionId },
          data: {
            status: "COMPLETED",
          },
        });
      }

      return updatedCheckIn;
    });

    return NextResponse.json({
      message: "Check-in completed successfully",
      checkIn: result,
    });
  } catch (error) {
    console.error("Error completing check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
