import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Create a roadmap from a template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can create roadmaps from templates" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { templateId, mentorshipId, title, startDate } = body;

    // Validation
    if (!templateId || !mentorshipId) {
      return NextResponse.json(
        { error: "Missing required fields: templateId, mentorshipId" },
        { status: 400 }
      );
    }

    // Get the template
    const template = await prisma.roadmap.findUnique({
      where: { id: templateId },
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

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (!template.isTemplate) {
      return NextResponse.json(
        { error: "This is not a template" },
        { status: 400 }
      );
    }

    // Verify template belongs to this mentor
    if (template.mentorship.mentorId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to use this template" },
        { status: 403 }
      );
    }

    // Verify target mentorship exists and belongs to this mentor
    const targetMentorship = await prisma.mentorship.findFirst({
      where: {
        id: mentorshipId,
        mentorId: user.id,
        status: "ACCEPTED",
      },
    });

    if (!targetMentorship) {
      return NextResponse.json(
        { error: "Mentorship not found or not authorized" },
        { status: 404 }
      );
    }

    // Calculate dates
    const roadmapStartDate = startDate ? new Date(startDate) : new Date();
    const roadmapEndDate = new Date(roadmapStartDate);
    roadmapEndDate.setDate(roadmapStartDate.getDate() + template.duration * 7);

    // Create roadmap from template
    const roadmap = await prisma.$transaction(async (tx) => {
      // Create the new roadmap
      const newRoadmap = await tx.roadmap.create({
        data: {
          mentorshipId,
          title: title || template.title,
          description: template.description,
          duration: template.duration,
          focusArea: template.focusArea,
          startDate: roadmapStartDate,
          endDate: roadmapEndDate,
          status: "ACTIVE",
          isTemplate: false,
        },
      });

      // Calculate milestone due dates based on proportional distribution
      const totalMilestones = template.milestones.length;
      const daysPerMilestone = Math.floor((template.duration * 7) / totalMilestones);

      // Copy milestones with calculated dates
      for (let i = 0; i < template.milestones.length; i++) {
        const milestone = template.milestones[i];

        // Calculate due date based on milestone order
        const milestoneDueDate = new Date(roadmapStartDate);
        milestoneDueDate.setDate(
          roadmapStartDate.getDate() + (i + 1) * daysPerMilestone
        );

        const newMilestone = await tx.milestone.create({
          data: {
            roadmapId: newRoadmap.id,
            title: milestone.title,
            description: milestone.description,
            order: milestone.order,
            dueDate: milestoneDueDate,
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

      // Return the complete roadmap
      return await tx.roadmap.findUnique({
        where: { id: newRoadmap.id },
        include: {
          milestones: {
            orderBy: { order: "asc" },
            include: {
              tasks: true,
              resources: true,
              checkIns: true,
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
    });

    return NextResponse.json({
      message: "Roadmap created from template successfully",
      roadmap,
    });
  } catch (error) {
    console.error("Error creating roadmap from template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
