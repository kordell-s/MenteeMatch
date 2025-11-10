import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId } = params;

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        tasks: {
          orderBy: { dueDate: "asc" },
        },
        checkIns: {
          orderBy: { scheduledDate: "asc" },
          include: {
            session: true,
          },
        },
        resources: true,
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

    // Verify access
    const isMentor = milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to view this milestone" },
        { status: 403 }
      );
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error fetching milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Check if milestone exists
    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        roadmap: {
          include: {
            mentorship: true,
          },
        },
      },
    });

    if (!existingMilestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const isMentor = existingMilestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = existingMilestone.roadmap.mentorship.menteeId === user.id;

    // Mentors can update everything, mentees can only update status
    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to update this milestone" },
        { status: 403 }
      );
    }

    // Build update data based on role
    const updateData: any = {};

    if (isMentor) {
      // Mentor can update everything
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
      if (body.order !== undefined) updateData.order = body.order;
      if (body.status !== undefined) updateData.status = body.status;
    } else if (isMentee && body.status !== undefined) {
      // Mentee can only update status (e.g., mark as in progress)
      updateData.status = body.status;
    }

    // Set completedAt when status is COMPLETED
    if (updateData.status === "COMPLETED" && !existingMilestone.completedAt) {
      updateData.completedAt = new Date();
    } else if (updateData.status !== "COMPLETED" && updateData.status !== undefined) {
      updateData.completedAt = null;
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
      include: {
        tasks: true,
        checkIns: true,
        resources: true,
      },
    });

    return NextResponse.json({
      message: "Milestone updated successfully",
      milestone: updatedMilestone,
    });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can delete milestones" },
        { status: 403 }
      );
    }

    const { milestoneId } = params;

    // Check if milestone exists and belongs to this mentor
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

    if (milestone.roadmap.mentorship.mentorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this milestone" },
        { status: 403 }
      );
    }

    // Delete milestone (cascade will delete related tasks, check-ins, resources)
    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
