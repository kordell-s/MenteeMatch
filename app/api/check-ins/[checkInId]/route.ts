import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { checkInId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkInId } = params;

    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: {
        session: true,
        milestone: {
          include: {
            roadmap: {
              include: {
                mentorship: true,
              },
            },
          },
        },
      },
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    // Verify access
    const isMentor = checkIn.milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = checkIn.milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to view this check-in" },
        { status: 403 }
      );
    }

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Error fetching check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Check if check-in exists
    const existingCheckIn = await prisma.checkIn.findUnique({
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
      },
    });

    if (!existingCheckIn) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }

    const isMentor = existingCheckIn.milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = existingCheckIn.milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to update this check-in" },
        { status: 403 }
      );
    }

    // Build update data based on role
    const updateData: any = {};

    if (body.scheduledDate !== undefined) updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.status !== undefined) updateData.status = body.status;

    // Mentor can update mentorNotes
    if (isMentor && body.mentorNotes !== undefined) {
      updateData.mentorNotes = body.mentorNotes;
    }

    // Mentee can update menteeNotes
    if (isMentee && body.menteeNotes !== undefined) {
      updateData.menteeNotes = body.menteeNotes;
    }

    // Set completedDate when status is COMPLETED
    if (updateData.status === "COMPLETED" && !existingCheckIn.completedDate) {
      updateData.completedDate = new Date();
    } else if (updateData.status !== "COMPLETED" && updateData.status !== undefined) {
      updateData.completedDate = null;
    }

    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: checkInId },
      data: updateData,
      include: {
        session: true,
        milestone: true,
      },
    });

    return NextResponse.json({
      message: "Check-in updated successfully",
      checkIn: updatedCheckIn,
    });
  } catch (error) {
    console.error("Error updating check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { checkInId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkInId } = params;

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
        { error: "Not authorized to delete this check-in" },
        { status: 403 }
      );
    }

    // Delete check-in
    await prisma.checkIn.delete({
      where: { id: checkInId },
    });

    return NextResponse.json({
      message: "Check-in deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
