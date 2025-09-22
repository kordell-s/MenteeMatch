import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const body = await request.json();
    const { status, action, userId } = body;

    // Find the task first to verify permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has permission to update this task
    // Either the mentor who assigned it or the mentee it's assigned to
    if (task.mentorId !== session.user.id && task.menteeId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Handle different update scenarios
    let updateData: any = {};

    if (status) {
      // Direct status update
      updateData.status = status;
    } else if (action) {
      // Action-based updates
      switch (action) {
        case "COMPLETE":
          updateData.status = "COMPLETED";
          updateData.completedAt = new Date();
          break;
        case "START":
          updateData.status = "IN_PROGRESS";
          updateData.startedAt = new Date();
          break;
        case "RESET":
          updateData.status = "PENDING";
          updateData.startedAt = null;
          updateData.completedAt = null;
          break;
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check permissions
    if (task.mentorId !== session.user.id && task.menteeId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
