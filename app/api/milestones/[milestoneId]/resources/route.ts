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
    const { title, url, description, resourceType } = body;

    // Validation
    if (!title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: title, url" },
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
        { error: "Not authorized to add resources to this milestone" },
        { status: 403 }
      );
    }

    // Create resource
    const resource = await prisma.roadmapResource.create({
      data: {
        milestoneId,
        title,
        url,
        description: description || null,
        resourceType: resourceType || "LINK",
      },
    });

    return NextResponse.json({
      message: "Resource added successfully",
      resource,
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Verify milestone exists and user has access
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        roadmap: {
          include: {
            mentorship: true,
          },
        },
        resources: {
          orderBy: { createdAt: "desc" },
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
        { error: "Not authorized to view resources for this milestone" },
        { status: 403 }
      );
    }

    return NextResponse.json(milestone.resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
