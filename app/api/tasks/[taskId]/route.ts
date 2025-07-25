import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const body = await request.json();
    const { action, userId } = body;
    const { taskId } = params;

    if (!taskId || !action || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: taskId, action, userId" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (action === "COMPLETE") {
      updateData = {
        status: "COMPLETED",
        completedAt: new Date(),
      };
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { 
        error: "Failed to update task",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
