import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resourceId } = params;

    // Check if resource exists
    const resource = await prisma.roadmapResource.findUnique({
      where: { id: resourceId },
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

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const isMentor = resource.milestone.roadmap.mentorship.mentorId === user.id;
    const isMentee = resource.milestone.roadmap.mentorship.menteeId === user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: "Not authorized to delete this resource" },
        { status: 403 }
      );
    }

    // Delete resource
    await prisma.roadmapResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resourceId } = params;
    const body = await request.json();

    // Check if resource exists
    const resource = await prisma.roadmapResource.findUnique({
      where: { id: resourceId },
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

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const isMentor = resource.milestone.roadmap.mentorship.mentorId === user.id;

    // Only mentor can update resources
    if (!isMentor) {
      return NextResponse.json(
        { error: "Only mentors can update resources" },
        { status: 403 }
      );
    }

    // Update resource
    const updatedResource = await prisma.roadmapResource.update({
      where: { id: resourceId },
      data: {
        title: body.title,
        url: body.url,
        description: body.description,
        resourceType: body.resourceType,
      },
    });

    return NextResponse.json({
      message: "Resource updated successfully",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
