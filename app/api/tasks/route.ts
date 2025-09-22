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
        { error: "Only mentors can assign tasks" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, dueDate, goalTag, menteeId } = body;

    if (!title || !menteeId) {
      return NextResponse.json(
        { error: "Title and menteeId are required" },
        { status: 400 }
      );
    }

    // Verify that the mentor has a mentorship relationship with the mentee
    const mentorship = await prisma.mentorship.findFirst({
      where: {
        mentorId: user.id,
        menteeId: menteeId,
        status: "ACCEPTED",
      },
    });

    if (!mentorship) {
      return NextResponse.json(
        { error: "No active mentorship relationship found" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        goalTag: goalTag || null,
        status: "PENDING",
        menteeId,
        mentorId: user.id,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const menteeId = searchParams.get("menteeId");
  
      if (!menteeId) {
        return NextResponse.json({ error: "Mentee ID is required" }, { status: 400 });
      }
  
      const tasks = await prisma.task.findMany({
        where: { menteeId },
        orderBy: { dueDate: "asc" },
      });
  
      return NextResponse.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
  }
