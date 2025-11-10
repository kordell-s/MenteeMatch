import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can create roadmaps" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      mentorshipId,
      title,
      description,
      duration, // in weeks: 4, 8, or 12
      focusArea,
      milestones, // Array of milestone objects
    } = body;

    // Validation
    if (!mentorshipId || !title || !duration || !focusArea) {
      return NextResponse.json(
        { error: "Missing required fields: mentorshipId, title, duration, focusArea" },
        { status: 400 }
      );
    }

    if (![4, 8, 12].includes(duration)) {
      return NextResponse.json(
        { error: "Duration must be 4, 8, or 12 weeks" },
        { status: 400 }
      );
    }

    // Verify mentorship exists and belongs to this mentor
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        id: mentorshipId,
        mentorId: user.id,
        status: "ACCEPTED",
      },
    });

    if (!mentorship) {
      return NextResponse.json(
        { error: "Mentorship not found or not authorized" },
        { status: 404 }
      );
    }

    // Calculate end date based on duration (weeks)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration * 7);

    // Create roadmap with milestones in a transaction
    const roadmap = await prisma.$transaction(async (tx) => {
      // Create the roadmap
      const newRoadmap = await tx.roadmap.create({
        data: {
          mentorshipId,
          title,
          description: description || null,
          duration,
          focusArea,
          startDate,
          endDate,
          status: "ACTIVE",
        },
      });

      // Create milestones if provided
      if (milestones && Array.isArray(milestones) && milestones.length > 0) {
        for (let i = 0; i < milestones.length; i++) {
          const milestone = milestones[i];
          await tx.milestone.create({
            data: {
              roadmapId: newRoadmap.id,
              title: milestone.title,
              description: milestone.description || null,
              order: i + 1,
              dueDate: new Date(milestone.dueDate),
              status: "NOT_STARTED",
            },
          });
        }
      }

      // Return roadmap with milestones
      return await tx.roadmap.findUnique({
        where: { id: newRoadmap.id },
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
    });

    return NextResponse.json({
      message: "Roadmap created successfully",
      roadmap,
    });
  } catch (error) {
    console.error("Error creating roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mentorshipId = searchParams.get("mentorshipId");
    const status = searchParams.get("status");
    const isTemplate = searchParams.get("isTemplate");

    // Build where clause
    const where: any = {};

    if (mentorshipId) {
      where.mentorshipId = mentorshipId;
    } else if (isTemplate === "true") {
      // Get templates created by this mentor
      where.isTemplate = true;
      where.mentorship = {
        mentorId: user.id,
      };
    } else {
      // Get all roadmaps where user is either mentor or mentee
      where.mentorship = {
        OR: [
          { mentorId: user.id },
          { menteeId: user.id },
        ],
      };
    }

    if (status) {
      where.status = status;
    }

    const roadmaps = await prisma.roadmap.findMany({
      where,
      include: {
        milestones: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { dueDate: "asc" },
            },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
