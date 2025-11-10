import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roadmapId } = params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
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
          },
        },
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                title: true,
                company: true,
              },
            },
            mentee: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                school: true,
              },
            },
          },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    // Verify user has access (is mentor or mentee in the mentorship)
    const isMentor = roadmap.mentorship.mentorId === user.id;
    const isMentee = roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to view this roadmap" },
        { status: 403 }
      );
    }

    // Calculate progress
    const totalMilestones = roadmap.milestones.length;
    const completedMilestones = roadmap.milestones.filter(
      (m) => m.status === "COMPLETED"
    ).length;
    const progressPercentage =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    // Calculate total tasks and completed tasks
    const totalTasks = roadmap.milestones.reduce(
      (sum, m) => sum + m.tasks.length,
      0
    );
    const completedTasks = roadmap.milestones.reduce(
      (sum, m) => sum + m.tasks.filter((t) => t.status === "COMPLETED").length,
      0
    );

    return NextResponse.json({
      ...roadmap,
      progress: {
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          percentage: progressPercentage,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          percentage:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can update roadmaps" },
        { status: 403 }
      );
    }

    const { roadmapId } = params;
    const body = await request.json();

    // Check if roadmap exists and belongs to this mentor
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        mentorship: true,
      },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    if (existingRoadmap.mentorship.mentorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this roadmap" },
        { status: 403 }
      );
    }

    // Update roadmap
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        focusArea: body.focusArea,
        // Don't allow changing duration or dates as it would affect milestones
      },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          include: {
            tasks: true,
            checkIns: true,
            resources: true,
          },
        },
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            mentee: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Roadmap updated successfully",
      roadmap: updatedRoadmap,
    });
  } catch (error) {
    console.error("Error updating roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can delete roadmaps" },
        { status: 403 }
      );
    }

    const { roadmapId } = params;

    // Check if roadmap exists and belongs to this mentor
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        mentorship: true,
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    if (roadmap.mentorship.mentorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this roadmap" },
        { status: 403 }
      );
    }

    // Soft delete by archiving instead of hard delete
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: {
        status: "ARCHIVED",
      },
    });

    return NextResponse.json({
      message: "Roadmap archived successfully",
    });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
