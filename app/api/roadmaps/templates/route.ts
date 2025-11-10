import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Save an existing roadmap as a template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can create templates" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roadmapId, templateName } = body;

    // Validation
    if (!roadmapId || !templateName) {
      return NextResponse.json(
        { error: "Missing required fields: roadmapId, templateName" },
        { status: 400 }
      );
    }

    // Get the original roadmap
    const originalRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        mentorship: true,
        milestones: {
          orderBy: { order: "asc" },
          include: {
            resources: true,
          },
        },
      },
    });

    if (!originalRoadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (originalRoadmap.mentorship.mentorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to create template from this roadmap" },
        { status: 403 }
      );
    }

    // Create a template copy
    const template = await prisma.$transaction(async (tx) => {
      // Create the template roadmap (reuse the same mentorshipId but mark as template)
      const newTemplate = await tx.roadmap.create({
        data: {
          mentorshipId: originalRoadmap.mentorshipId,
          title: originalRoadmap.title,
          description: originalRoadmap.description,
          duration: originalRoadmap.duration,
          focusArea: originalRoadmap.focusArea,
          startDate: new Date(), // Templates use current date as placeholder
          endDate: new Date(), // Will be recalculated when used
          isTemplate: true,
          templateName,
          status: "ACTIVE",
        },
      });

      // Copy milestones (relative timing preserved)
      for (const milestone of originalRoadmap.milestones) {
        const newMilestone = await tx.milestone.create({
          data: {
            roadmapId: newTemplate.id,
            title: milestone.title,
            description: milestone.description,
            order: milestone.order,
            dueDate: new Date(), // Placeholder, will be recalculated
            status: "NOT_STARTED",
          },
        });

        // Copy resources
        for (const resource of milestone.resources) {
          await tx.roadmapResource.create({
            data: {
              milestoneId: newMilestone.id,
              title: resource.title,
              url: resource.url,
              description: resource.description,
              resourceType: resource.resourceType,
            },
          });
        }
      }

      // Return the complete template
      return await tx.roadmap.findUnique({
        where: { id: newTemplate.id },
        include: {
          milestones: {
            orderBy: { order: "asc" },
            include: {
              resources: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all templates for the current mentor
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can view templates" },
        { status: 403 }
      );
    }

    // Get all templates created by this mentor
    const templates = await prisma.roadmap.findMany({
      where: {
        isTemplate: true,
        mentorship: {
          mentorId: user.id,
        },
      },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          include: {
            resources: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
