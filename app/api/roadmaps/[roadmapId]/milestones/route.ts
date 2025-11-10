import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { roadmapId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can create milestones" },
        { status: 403 }
      );
    }

    const { roadmapId } = params;
    const body = await request.json();
    const { title, description, dueDate, order } = body;

    // Validation
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, dueDate" },
        { status: 400 }
      );
    }

    // Verify roadmap exists and belongs to this mentor
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        mentorship: true,
        milestones: true,
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
        { error: "Not authorized to modify this roadmap" },
        { status: 403 }
      );
    }

    // Determine order if not provided
    const milestoneOrder = order || roadmap.milestones.length + 1;

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        roadmapId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        order: milestoneOrder,
        status: "NOT_STARTED",
      },
      include: {
        tasks: true,
        checkIns: true,
        resources: true,
      },
    });

    return NextResponse.json({
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
